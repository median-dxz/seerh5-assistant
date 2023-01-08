import { delay, wrapper } from '../common';
import { CMDID, EVENTS as hook } from '../const';

const EmitEvent = (type: string, detail = {}) => {
    const { SAEventTarget: GlobalEventManager } = window;
    GlobalEventManager.dispatchEvent(new CustomEvent(type, { detail }));
};

// (moduleName) => {
//     if (ModuleManager.appJs[moduleName] === false) {
//         EmitEvent(hook.Module.loadScript, moduleName);
//     }
// },

// EventManager.dispatchEvent(new egret.Event(ModuleEvent.OPEN_MODULE,!1,!1,n))

ModuleManager.beginShow = wrapper(ModuleManager.beginShow, undefined, (r, moduleName) => {
    EmitEvent(hook.Module.construct, moduleName);
    const moduleClass: String = (ModuleManager.currModule as any).__class__;
    switch (moduleName) {
        case 'battleResultPanel':
            if (
                moduleClass === 'battleResultPanel.BattleResultPanel' ||
                moduleClass === 'battleResultPanel.BattleFailPanel'
            ) {
                EmitEvent(hook.BattlePanel.endPropShown);
            }
        default:
            break;
    }
});

ModuleManager.removeModuleInstance = function (module) {
    const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
    if (key) {
        // console.log(module);
        EmitEvent(hook.Module.destroy, module.moduleName);
        const config = module.getModuleConfig();
        this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
        delete this._modules[key];
    }
};

AwardItemDialog.prototype.startEvent = wrapper(
    AwardItemDialog.prototype.startEvent,
    undefined,
    async function (this: AwardItemDialog) {
        EmitEvent(hook.Award.show);
        await delay(500);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
        this.destroy();
    }
);

AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (r, dialog: any, items: any) {
    EmitEvent(hook.Award.receive, { items });
});

PetFightController.setup = wrapper(PetFightController.setup, undefined, function () {
    EmitEvent(hook.BattlePanel.panelReady);
    const { enemyMode, playerMode } = FighterModelFactory;
    if (!enemyMode || !playerMode) return;
    enemyMode.setHpView(true);
    enemyMode.setHpView = function () {
        this.propView!.isShowFtHp = true;
    };
    playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode), undefined, () => {
        EmitEvent(hook.BattlePanel.roundEnd);
    });
});

EventManager.addEventListener(
    PetFightEvent.ALARM_CLICK,
    () => {
        EmitEvent(hook.BattlePanel.battleEnd);
    },
    null
);

SocketConnection.addCmdListener(CMDID.NOTE_USE_SKILL, (e: SocketEvent) => {
    const data: egret.ByteArray = Object.create(
        Object.getPrototypeOf(e.data),
        Object.getOwnPropertyDescriptors(e.data)
    );
    const info = new UseSkillInfo(data);
    EmitEvent(hook.BattlePanel.onRoundData, { info: [info.firstAttackInfo, info.secondAttackInfo] });
});

export {};
