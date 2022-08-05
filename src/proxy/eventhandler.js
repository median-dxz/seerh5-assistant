import { warpper, delay } from './utils/common.js';
import Consts from './const/_exports.js';

const hooks = Consts.EVENTS;

const GlabalEventManager = new EventTarget();

AwardItemDialog.prototype.startEvent = warpper(AwardItemDialog.prototype.startEvent, null, function () {
    GlabalEventManager.dispatchEvent(new CustomEvent(hooks.AwardDialog.show, { detail: { dialog: this } }));
});

PetFightController.setup = warpper(PetFightController.setup, null, () => {
    GlabalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.start, { detail: null }));
});

EventManager.addEventListener('new_round', () => {
    GlabalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.roundEnd, { detail: null }));
});

PetUpdatePropController.prototype.show = warpper(PetUpdatePropController.prototype.show, null, () => {
    GlabalEventManager.dispatchEvent(new CustomEvent(hooks.BattlePanel.completed, { detail: null }));
});

GlabalEventManager.addEventListener(hooks.AwardDialog.show, async (e) => {
    await delay(500);
    LevelManager.stage.removeEventListener(
        egret.TouchEvent.TOUCH_TAP,
        e.detail.dialog.startRemoveDialog,
        e.detail.dialog
    );
    e.detail.dialog.destroy();
});

export { GlabalEventManager as SAEventManager };
