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

ModuleManager._openModelCompete = warpper(ModuleManager._openModelCompete, null, function () {
    GlobalEventManager.dispatchEvent(
        new CustomEvent(hooks.Module.show, { detail: { moduleName: this.currModule.moduleName } })
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
