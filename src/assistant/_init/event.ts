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

ModuleManager.beginShow = wrapper(ModuleManager.beginShow, undefined, (r, moduleName) => {
    EmitEvent(hook.Module.construct, moduleName);
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
    FighterModelFactory.enemyMode!.setHpView(true);
    FighterModelFactory.enemyMode!.setHpView = function () {
        this.propView!.isShowFtHp = true;
    };
});

EventManager.addEventListener(
    'new_round',
    () => {
        EmitEvent(hook.BattlePanel.roundEnd);
    },
    null
);

PetUpdatePropController.prototype.show = wrapper(PetUpdatePropController.prototype.show, undefined, async function () {
    EmitEvent(hook.BattlePanel.completed, { isWin: FightManager.isWin });
    await delay(500);
    const currentModule = ModuleManager.currModule;
    if (FightManager.isWin) {
        currentModule.touchHandle && currentModule.touchHandle();
    } else {
        currentModule.onClose && currentModule.onClose();
    }
});

SocketConnection.addCmdListener(CMDID.NOTE_USE_SKILL, (e: SocketEvent) => {
    const data: egret.ByteArray = Object.create(
        Object.getPrototypeOf(e.data),
        Object.getOwnPropertyDescriptors(e.data)
    );
    const info = new UseSkillInfo(data);
    EmitEvent(hook.BattlePanel.onRoundData, { info: [info.firstAttackInfo, info.secondAttackInfo] });
});

export {};
