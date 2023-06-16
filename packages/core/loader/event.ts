/* eslint-disable @typescript-eslint/unbound-method */
import { SAEventTarget, delay, hookPrototype, wrapper, wrapperAsync } from '../common/utils.js';
import { CmdMask, Hook } from '../constant/index.js';

export default () => {
    // (moduleName) => {
    //     if (ModuleManager.appJs[moduleName] === false) {
    //         SAEventTarget.emit(hook.Module.loadScript, moduleName);
    //     }
    // },

    // EventManager.dispatchEvent(new egret.Event(ModuleEvent.OPEN_MODULE,!1,!1,n))

    BasicMultPanelModule.prototype.onShowMainPanel = async function () {
        await this.openPanel(this._mainPanelName);
        SAEventTarget.emit(Hook.Module.openMainPanel, { module: this.moduleName, panel: this._mainPanelName });
    };

    type withClass<T> = T & { __class__: string };
    ModuleManager.beginShow = wrapperAsync(ModuleManager.beginShow, undefined, function (_, moduleName: string) {
        SAEventTarget.emit(Hook.Module.construct, moduleName);
        const curModule = ModuleManager.currModule as withClass<typeof ModuleManager.currModule>;
        const moduleClass = curModule.__class__;
        switch (moduleName) {
            case 'battleResultPanel':
                if (
                    moduleClass === 'battleResultPanel.BattleResultPanel' ||
                    moduleClass === 'battleResultPanel.BattleFailPanel'
                ) {
                    SAEventTarget.emit(Hook.BattlePanel.endPropShown);
                }
                break;
            default:
                break;
        }
    });
    ModuleManager.removeModuleInstance = function (module) {
        const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
        if (key) {
            // console.log(module);
            SAEventTarget.emit(Hook.Module.destroy, module.moduleName);
            const config = module.getModuleConfig();
            this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
            delete this._modules[key];
        }
    };

    hookPrototype(AwardItemDialog, 'startEvent', async function (originalFunc, ...args) {
        originalFunc.apply(this, args);
        SAEventTarget.emit(Hook.Award.show);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
        await delay(500);
        this.destroy();
    });

    AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (_, _dialog, items) {
        SAEventTarget.emit(Hook.Award.receive, { items });
    });

    PetFightController.onStartFight = wrapper(PetFightController.onStartFight, undefined, function () {
        SAEventTarget.emit(Hook.BattlePanel.panelReady);
        const { enemyMode, playerMode } = FighterModelFactory;
        if (!enemyMode || !playerMode) return;
        enemyMode.setHpView(true);
        enemyMode.setHpView = function () {
            this.propView.isShowFtHp = true;
        };
        playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode), undefined, () => {
            SAEventTarget.emit(Hook.BattlePanel.roundEnd);
        });
    });

    EventManager.addEventListener(
        PetFightEvent.ALARM_CLICK,
        () => SAEventTarget.emit(Hook.BattlePanel.battleEnd),
        null
    );

    SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send, (cmd, data) => {
        if (!CmdMask.includes(cmd)) {
            SAEventTarget.emit(Hook.Socket.send, { cmd, data });
        }
    });

    SocketConnection.mainSocket.dispatchCmd = wrapper(SocketConnection.mainSocket.dispatchCmd, (cmd, head, buffer) => {
        if (!CmdMask.includes(cmd)) {
            SAEventTarget.emit(Hook.Socket.receive, { cmd, buffer });
        }
    });
};
