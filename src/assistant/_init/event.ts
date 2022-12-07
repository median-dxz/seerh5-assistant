import { delay, wrapper } from '../common';
import { CMDID, EVENTS as hook } from '../const';

const EmitEvent = (type: string, detail = {}) => {
    const { SAEventTarget: GlobalEventManager } = window;
    GlobalEventManager.dispatchEvent(new CustomEvent(type, { detail }));
};

ModuleManager.beginShow = wrapper(ModuleManager.beginShow, (moduleName: string) => {
    if (!ModuleManager.appJs[moduleName]) {
        EmitEvent(hook.Module.loaded, { moduleName });
    }
});

ModuleManager._openModelCompete = wrapper(ModuleManager._openModelCompete, undefined, function (this: ModuleManager) {
    if (ModuleManager.currModule instanceof BasicMultPanelModule) {
        const moduleName = ModuleManager.currModule.moduleName;
        EmitEvent(hook.Module.show, { moduleName });
    } else {
        EmitEvent(hook.Module.show, { moduleName: 'unknown' });
    }
});

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

AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (dialog: any, items: any) {
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
