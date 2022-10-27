import { CMDID, EVENTS as hooks } from '../const';
const { delay, wrapper, SAEventTarget: GlobalEventManager } = window;

const EmitEvent = (type: string, detail = {}) => {
    GlobalEventManager.dispatchEvent(new CustomEvent(type, { detail }));
};

ModuleManager.beginShow = wrapper(ModuleManager.beginShow, function (moduleName: string) {
    if (!ModuleManager.appJs[moduleName]) {
        EmitEvent(hooks.Module.loaded, { moduleName });
    }
});

ModuleManager._openModelCompete = wrapper(ModuleManager._openModelCompete, undefined, function (this: any) {
    const moduleName = this.currModule.moduleName;
    EmitEvent(hooks.Module.show, { moduleName });
});

AwardItemDialog.prototype.startEvent = wrapper(AwardItemDialog.prototype.startEvent, undefined, async function (this: any) {
    EmitEvent(hooks.Award.show);
    await delay(500);
    LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
    this.destroy();
});

AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (dialog: any, items: any) {
    EmitEvent(hooks.Award.receive, { items });
});

PetFightController.setup = wrapper(PetFightController.setup, undefined, function () {
    EmitEvent(hooks.BattlePanel.panelReady);
    FighterModelFactory.enemyMode!.setHpView(true);
    FighterModelFactory.enemyMode!.setHpView = function (this: typeof FighterModelFactory) {
        this.propView!.isShowFtHp = true;
    };
});

EventManager.addEventListener('new_round', () => {
    EmitEvent(hooks.BattlePanel.roundEnd);
});

PetUpdatePropController.prototype.show = wrapper(PetUpdatePropController.prototype.show, undefined, async function () {
    EmitEvent(hooks.BattlePanel.completed, { isWin: FightManager.isWin });
    await delay(500);
    const curMod = ModuleManager.currModule;
    if (FightManager.isWin) {
        curMod.touchHandle && curMod.touchHandle();
    } else {
        curMod.onClose && curMod.onClose();
    }
});

SocketConnection.addCmdListener(CMDID.NOTE_USE_SKILL, (dataPackage) => {
    const data = Object.create(
        Object.getPrototypeOf(dataPackage.data),
        Object.getOwnPropertyDescriptors(dataPackage.data)
    );
    const info = new UseSkillInfo(data);
    EmitEvent(hooks.BattlePanel.onRoundData, { info: [info.firstAttackInfo, info.secondAttackInfo] });
});

export {};
