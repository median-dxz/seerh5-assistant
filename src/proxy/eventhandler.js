import { warpper, delay } from './utils/common.js';
import Consts from './const/_exports.js';

const hooks = Consts.EVENTS;

const GlobalEventManager = new EventTarget();

AwardItemDialog.prototype.startEvent = warpper(AwardItemDialog.prototype.startEvent, null, function () {
    GlobalEventManager.dispatchEvent(new CustomEvent(hooks.AwardDialog.show, { detail: { dialog: this } }));
});

PetFightController.setup = warpper(PetFightController.setup, null, () => {
    GlobalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.start, { detail: null }));
});

EventManager.addEventListener('new_round', () => {
    GlobalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.roundEnd, { detail: null }));
});

PetUpdatePropController.prototype.show = warpper(PetUpdatePropController.prototype.show, null, () => {
    GlobalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.completed, { detail: null }));
});

ModuleManager.beginShow = warpper(
    ModuleManager.beginShow,
    function () {
        if (!ModuleManager.appJs[arguments[0]]) {
            GlobalEventManager.dispatchEvent(
                new CustomEvent(hooks.Module.loaded, { detail: { moduleName: arguments[0] } })
            );
        }
    },
    null
);

ModuleManager._openModelCompete = warpper(ModuleManager._openModelCompete, null, function () {
    GlobalEventManager.dispatchEvent(
        new CustomEvent(hooks.Module.show, { detail: { moduleName: this.currModule.moduleName } })
    );
});

GlobalEventManager.addEventListener(hooks.Module.loaded, async (e) => {
    console.log(`[EventManager]: 检测到模块开启: ${e.detail.moduleName}`);
});

SocketConnection.addCmdListener(CommandID.NOTE_USE_SKILL, (d) => {
    const data = Object.create(Object.getPrototypeOf(d.data), Object.getOwnPropertyDescriptors(d.data));
    const info = new UseSkillInfo(data);
    const fi = info.firstAttackInfo,
        si = info.secondAttackInfo;
    console.log(
        `[EventManager]: 对局信息更新:
            先手方:${fi.userID}
            所在回合:${fi.round}
            造成伤害:${fi.lostHP}
            恢复hp:${fi.gainHP}
            剩余hp:${fi.remainHP}
            是否暴击:${fi.isCrit}
            使用技能id:${fi.skillID}
            ===========
            后手方:${si.userID}
            所在回合:${si.round}
            造成伤害:${si.lostHP}
            恢复hp:${si.gainHP}
            剩余hp:${si.remainHP} 
            是否暴击:${si.isCrit}
            使用技能id:${si.skillID}
    `
    );
});

GlobalEventManager.addEventListener(hooks.AwardDialog.show, async (e) => {
    await delay(500);
    LevelManager.stage.removeEventListener(
        egret.TouchEvent.TOUCH_TAP,
        e.detail.dialog.startRemoveDialog,
        e.detail.dialog
    );
    e.detail.dialog.destroy();
});

export { GlobalEventManager as SAEventManager };
