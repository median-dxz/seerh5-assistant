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

ModuleManager._openModelCompete = wrapper<typeof ModuleManager>(
    ModuleManager._openModelCompete,
    undefined,
    function () {
        if (this.currModule instanceof BasicMultPanelModule) {
            const moduleName = this.currModule.moduleName;
            EmitEvent(hooks.Module.show, { moduleName });
        } else {
            EmitEvent(hooks.Module.show, { moduleName: 'unknown' });
        }
    }
);

AwardItemDialog.prototype.startEvent = wrapper<typeof AwardItemDialog>(
    AwardItemDialog.prototype.startEvent,
    undefined,
    async function () {
        EmitEvent(hooks.Award.show);
        await delay(500);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
        this.destroy();
    }
);

AwardManager.showDialog = wrapper(AwardManager.showDialog, undefined, function (dialog: any, items: any) {
    EmitEvent(hooks.Award.receive, { items });
});

PetFightController.setup = wrapper(PetFightController.setup, undefined, function () {
    EmitEvent(hooks.BattlePanel.panelReady);
    FighterModelFactory.enemyMode!.setHpView(true);
    FighterModelFactory.enemyMode!.setHpView = function () {
        this.propView!.isShowFtHp = true;
    };
});

EventManager.addEventListener(
    'new_round',
    () => {
        EmitEvent(hooks.BattlePanel.roundEnd);
    },
    null
);

PetUpdatePropController.prototype.show = wrapper(PetUpdatePropController.prototype.show, undefined, async function () {
    EmitEvent(hooks.BattlePanel.completed, { isWin: FightManager.isWin });
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
    EmitEvent(hooks.BattlePanel.onRoundData, { info: [info.firstAttackInfo, info.secondAttackInfo] });
});

export {};
