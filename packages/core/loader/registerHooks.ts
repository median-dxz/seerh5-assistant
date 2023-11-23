/* eslint-disable @typescript-eslint/unbound-method */
import {
    delay,
    hookFn,
    hookPrototype,
    restoreHookedFn,
    wrapper,
    wrapperAsync,
} from '../common/utils.js';
import { Hook } from '../constant/index.js';
import { HookRegistry } from '../emitters/index.js';

export default () => {
    HookRegistry.register(Hook.Module.loadScript, (resolve) => {
        hookFn(ModuleManager, 'loadScript', async function (originalFunc, scriptName) {
            await originalFunc(scriptName);
            resolve(scriptName);
        });
        return () => restoreHookedFn(ModuleManager, 'loadScript');
    });

    BasicMultPanelModule.prototype.onShowMainPanel = async function () {
        await this.openPanel(this._mainPanelName);
        SEAHookEmitter.emit(Hook.Module.openMainPanel, { module: this.moduleName, panel: this._mainPanelName });
    };

    type withClass<T> = T & { __class__: string };

    ModuleManager.beginShow = wrapperAsync(
        ModuleManager.beginShow,
        undefined,
        function (_r, module, _1, _2, _3, _4, config) {
            let id;
            if (config) {
                id = (config as { id: number; moduleName: string }).id;
            }
            SEAHookEmitter.emit(Hook.Module.construct, { module, id });
            const curModule = ModuleManager.currModule as withClass<typeof ModuleManager.currModule>;
            const moduleClass = curModule.__class__;
            switch (module) {
                case 'battleResultPanel':
                    if (
                        moduleClass === 'battleResultPanel.BattleResultPanel' ||
                        moduleClass === 'battleResultPanel.BattleFailPanel'
                    ) {
                        SEAHookEmitter.emit(Hook.Battle.endPropShown);
                    }
                    break;
                default:
                    break;
            }
        }
    );

    ModuleManager.removeModuleInstance = function (module) {
        const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
        if (key) {
            // console.log(module);
            SEAHookEmitter.emit(Hook.Module.destroy, module.moduleName);
            const config = module.getModuleConfig();
            this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
            delete this._modules[key];
        }
    };

    hookPrototype(PopViewManager, 'openView', function (originalFunc, r, ...args) {
        originalFunc(r, ...args);
        SEAHookEmitter.emit(Hook.PopView.open, (Object.getPrototypeOf(r) as withClass<PopView>).__class__);
    });

    hookPrototype(PopViewManager, 'hideView', function (originalFunc, id, ...args) {
        originalFunc(id, ...args);
        if (typeof id !== 'number') {
            id = id.hashCode;
        }
        const popView = this.__viewMap__['key_' + id];
        if (popView) {
            SEAHookEmitter.emit(Hook.PopView.close, (Object.getPrototypeOf(popView) as withClass<PopView>).__class__);
        }
    });

    hookPrototype(AwardItemDialog, 'startEvent', async function (originalFunc, ...args) {
        originalFunc.apply(this, args);
        SEAHookEmitter.emit(Hook.Award.show);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
        await delay(500);
        this.destroy();
    });

    AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (_, _dialog, items) {
        SEAHookEmitter.emit(Hook.Award.receive, { items });
    });

    PetFightController.onStartFight = wrapper(PetFightController.onStartFight, undefined, function () {
        const { enemyMode, playerMode } = FighterModelFactory;
        if (!enemyMode || !playerMode) return;
        enemyMode.setHpView(true);
        enemyMode.setHpView = function () {
            this.propView.isShowFtHp = true;
        };
        playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode), undefined, () => {
            SEAHookEmitter.emit(Hook.Battle.roundEnd);
        });
    });

    // 因为这个Socket监听注册发生在Battle模块初始化的时候, 在这边Hook会滞后, 要重新注册
    SocketConnection.removeCmdListener(
        CommandID.NOTE_START_FIGHT,
        FightNoteCmdListener.startFight,
        FightNoteCmdListener
    );
    FightNoteCmdListener.startFight = wrapper(FightNoteCmdListener.startFight, undefined, function () {
        SEAHookEmitter.emit(Hook.Battle.battleStart);
    });
    SocketConnection.addCmdListener(CommandID.NOTE_START_FIGHT, FightNoteCmdListener.startFight, FightNoteCmdListener);

    EventManager.addEventListener(PetFightEvent.ALARM_CLICK, () => SEAHookEmitter.emit(Hook.Battle.battleEnd), null);

    const CmdMask = [
        1002, // SYSTEM_TIME
        2001, // ENTER_MAP
        2002, // LEAVE_MAP
        2004, // MAP_OGRE_LIST
        2441, // LOAD_PERCENT
        9019, // NONO_FOLLOW_OR_HOOM
        9274, //PET_GET_LEVEL_UP_EXP
        41228, // SYSTEM_TIME_CHECK
    ];

    SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send, (cmd, data) => {
        if (!CmdMask.includes(cmd)) {
            SEAHookEmitter.emit(Hook.Socket.send, { cmd, data });
        }
    });

    SocketConnection.mainSocket.dispatchCmd = wrapper(SocketConnection.mainSocket.dispatchCmd, (cmd, head, buffer) => {
        if (!CmdMask.includes(cmd)) {
            SEAHookEmitter.emit(Hook.Socket.receive, { cmd, buffer });
        }
    });
};
