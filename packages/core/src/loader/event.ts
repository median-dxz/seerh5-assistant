import { SAEventTarget, delay, wrapper } from '../common';
import { CmdMask, Hook } from '../constant';

export function HookLoader() {
    const EmitEvent = (type: string, detail = {}) => {
        SAEventTarget.dispatchEvent(new CustomEvent(type, { detail }));
    };

    // (moduleName) => {
    //     if (ModuleManager.appJs[moduleName] === false) {
    //         EmitEvent(hook.Module.loadScript, moduleName);
    //     }
    // },

    // EventManager.dispatchEvent(new egret.Event(ModuleEvent.OPEN_MODULE,!1,!1,n))

    ModuleManager.beginShow = wrapper(ModuleManager.beginShow, undefined, (r, moduleName) => {
        EmitEvent(Hook.Module.construct, moduleName);
        const moduleClass: String = (ModuleManager.currModule as any).__class__;
        switch (moduleName) {
            case 'battleResultPanel':
                if (
                    moduleClass === 'battleResultPanel.BattleResultPanel' ||
                    moduleClass === 'battleResultPanel.BattleFailPanel'
                ) {
                    EmitEvent(Hook.BattlePanel.endPropShown);
                }
            default:
                break;
        }
    });

    ModuleManager.removeModuleInstance = function (module) {
        const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
        if (key) {
            // console.log(module);
            EmitEvent(Hook.Module.destroy, module.moduleName);
            const config = module.getModuleConfig();
            this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
            delete this._modules[key];
        }
    };

    AwardItemDialog.prototype.startEvent = wrapper(
        AwardItemDialog.prototype.startEvent,
        undefined,
        async function (this: AwardItemDialog) {
            EmitEvent(Hook.Award.show);
            await delay(500);
            LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
            this.destroy();
        }
    );

    AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (r, dialog: any, items: any) {
        EmitEvent(Hook.Award.receive, { items });
    });

    PetFightController.setup = wrapper(PetFightController.setup, undefined, function () {
        EmitEvent(Hook.BattlePanel.panelReady);
        const { enemyMode, playerMode } = FighterModelFactory;
        if (!enemyMode || !playerMode) return;
        enemyMode.setHpView(true);
        enemyMode.setHpView = function () {
            this.propView!.isShowFtHp = true;
        };
        playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode), undefined, () => {
            EmitEvent(Hook.BattlePanel.roundEnd);
        });
    });

    EventManager.addEventListener(
        PetFightEvent.ALARM_CLICK,
        () => {
            EmitEvent(Hook.BattlePanel.battleEnd);
        },
        null
    );

    SocketConnection.mainSocket.send = wrapper(
        SocketConnection.mainSocket.send.bind(SocketConnection.mainSocket) as typeof SocketConnection.mainSocket.send,
        (cmd, data) => {
            if (!CmdMask.includes(cmd)) {
                EmitEvent(Hook.Socket.send, {
                    cmd,
                    data,
                });
            }
        }
    );
}
