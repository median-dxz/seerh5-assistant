/* eslint-disable @typescript-eslint/unbound-method */
import { SEAEventTarget, delay, hookPrototype, wrapper, wrapperAsync } from '../common/utils.js';
import { CmdMask, Hook } from '../constant/index.js';

export default () => {
    BasicMultPanelModule.prototype.onShowMainPanel = async function () {
        await this.openPanel(this._mainPanelName);
        SEAEventTarget.emit(Hook.Module.openMainPanel, { module: this.moduleName, panel: this._mainPanelName });
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
            SEAEventTarget.emit(Hook.Module.construct, { module, id });
            const curModule = ModuleManager.currModule as withClass<typeof ModuleManager.currModule>;
            const moduleClass = curModule.__class__;
            switch (module) {
                case 'battleResultPanel':
                    if (
                        moduleClass === 'battleResultPanel.BattleResultPanel' ||
                        moduleClass === 'battleResultPanel.BattleFailPanel'
                    ) {
                        SEAEventTarget.emit(Hook.Battle.endPropShown);
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
            SEAEventTarget.emit(Hook.Module.destroy, module.moduleName);
            const config = module.getModuleConfig();
            this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
            delete this._modules[key];
        }
    };

    hookPrototype(PopViewManager, 'openView', function (originalFunc, r, ...args) {
        originalFunc(r, ...args);
        SEAEventTarget.emit(Hook.PopView.open, (Object.getPrototypeOf(r) as withClass<PopView>).__class__);
    });

    hookPrototype(PopViewManager, 'hideView', function (originalFunc, id, ...args) {
        originalFunc(id, ...args);
        if (typeof id !== 'number') {
            id = id.hashCode;
        }
        const popView = this.__viewMap__['key_' + id];
        if (popView) {
            SEAEventTarget.emit(Hook.PopView.close, (Object.getPrototypeOf(popView) as withClass<PopView>).__class__);
        }
    });

    hookPrototype(AwardItemDialog, 'startEvent', async function (originalFunc, ...args) {
        originalFunc.apply(this, args);
        SEAEventTarget.emit(Hook.Award.show);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
        await delay(500);
        this.destroy();
    });

    AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (_, _dialog, items) {
        SEAEventTarget.emit(Hook.Award.receive, { items });
    });

    PetFightController.onStartFight = wrapper(PetFightController.onStartFight, undefined, function () {
        const { enemyMode, playerMode } = FighterModelFactory;
        if (!enemyMode || !playerMode) return;
        enemyMode.setHpView(true);
        enemyMode.setHpView = function () {
            this.propView.isShowFtHp = true;
        };
        playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode), undefined, () => {
            SEAEventTarget.emit(Hook.Battle.roundEnd);
        });
    });

    // 因为这个Socket监听注册发生在Battle模块初始化的时候, 在这边Hook会滞后, 要重新注册
    SocketConnection.removeCmdListener(
        CommandID.NOTE_START_FIGHT,
        FightNoteCmdListener.startFight,
        FightNoteCmdListener
    );
    FightNoteCmdListener.startFight = wrapper(FightNoteCmdListener.startFight, undefined, function () {
        SEAEventTarget.emit(Hook.Battle.battleStart);
    });
    SocketConnection.addCmdListener(CommandID.NOTE_START_FIGHT, FightNoteCmdListener.startFight, FightNoteCmdListener);

    EventManager.addEventListener(PetFightEvent.ALARM_CLICK, () => SEAEventTarget.emit(Hook.Battle.battleEnd), null);

    SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send, (cmd, data) => {
        if (!CmdMask.includes(cmd)) {
            SEAEventTarget.emit(Hook.Socket.send, { cmd, data });
        }
    });

    SocketConnection.mainSocket.dispatchCmd = wrapper(SocketConnection.mainSocket.dispatchCmd, (cmd, head, buffer) => {
        if (!CmdMask.includes(cmd)) {
            SEAEventTarget.emit(Hook.Socket.receive, { cmd, buffer });
        }
    });
};
