export {};
import { CMDID, EVENTS as hooks } from '../const/_exports.js';

const { delay, warpper, SAEventManager: GlobalEventManager } = window;

const EmitEvnet = (type, detail = {}) => {
    GlobalEventManager.dispatchEvent(new CustomEvent(type, { detail }));
};

ModuleManager.beginShow = warpper(ModuleManager.beginShow, function () {
    if (!ModuleManager.appJs[arguments[0]]) {
        const moduleName = arguments[0];
        EmitEvnet(hooks.Module.loaded, { moduleName });
    }
});

ModuleManager._openModelCompete = warpper(ModuleManager._openModelCompete, undefined, function () {
    const moduleName = this.currModule.moduleName;
    EmitEvnet(hooks.Module.show, { moduleName });
});

AwardItemDialog.prototype.startEvent = warpper(AwardItemDialog.prototype.startEvent, undefined, async function () {
    EmitEvnet(hooks.Award.show);
    await delay(500);
    LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
    this.destroy();
});

AwardManager.showDialog = warpper(AwardManager.showDialog, undefined, function (dialog, items) {
    EmitEvnet(hooks.Award.receive, { items });
});

PetFightController.setup = warpper(PetFightController.setup, undefined, function () {
    EmitEvnet(hooks.BattlePanel.start);
    FighterModelFactory.enemyMode.setHpView(true);
    FighterModelFactory.enemyMode.setHpView = function () {
        this.propView.isShowFtHp = true;
    };
});

EventManager.addEventListener('new_round', () => {
    EmitEvnet(hooks.BattlePanel.roundEnd);
});

PetUpdatePropController.prototype.show = warpper(PetUpdatePropController.prototype.show, undefined, async function () {
    EmitEvnet(hooks.BattlePanel.completed, { isWin: FightManager.isWin });
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
    EmitEvnet(hooks.BattlePanel.onRoundData, { info: [info.firstAttackInfo, info.secondAttackInfo] });
});
