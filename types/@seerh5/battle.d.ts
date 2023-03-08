declare class PetFightController {
    static roundTimes: number;
    static GameSpeed: number;
    static setFightSpeed(speed: number): void;
    static setup(): void;
    static mvContainer: egret.DisplayObjectContainer;
}

declare class FightOverController {
    static destroy(): void;
}

declare class TimerManager {
    static countDownOverHandler(): void;
}

declare class UseSkillController extends egret.EventDispatcher {
    textTimer: egret.Timer | null;
    closeTxt(): void;
    onMovieOver(): void;
}

declare class FighterModelFactory {
    static playerMode?: PlayerModel;
    static enemyMode?: BaseFighterModel;
}

declare class PlayerModel extends BaseFighterModel {
    nextRound(): void;
}

declare class BaseFighterModel extends egret.EventDispatcher {
    setHpView: (show: boolean) => void;
    skillBtnViews: Array<SkillBtnView>;
    subject: SAType.ObserverList<ToolBtnPanelObserver>;
    get info(): FightPetInfo;
    get propView(): BaseFighterPropView;
}

declare class RenewPPEffect {
    constructor(model: BaseFighterModel, itemId: number);
    timer: egret.Timer | null;
    closeTxt(): void;
}

declare class ToolBtnPanelObserver {
    skillPanel: SkillPanel;
    showPet(): void;
    petPanel: PetSelectPanel;
    showFight(): void;
    itemPanel: FightItemPanel;
    showItem(index: number): void;
}

declare class BaseControlPanel extends egret.EventDispatcher {}

declare class SkillPanel extends BaseControlPanel {
    auto(): void;
}

declare class PetSelectPanel extends BaseControlPanel {
    _petsArray: Array<PetBtnView>;
}

declare class FightItemPanel extends BaseControlPanel {
    onUseItem(itemID: number): void;
}

declare class BaseFighterPropView {
    get isShowFtHp(): boolean;
    set isShowFtHp(showFtHp: boolean);
    dispatchNoBlood: boolean;
}

declare class SkillBtnView extends egret.EventDispatcher {
    autoUse(): void;
    get skillID(): number;
    get pp(): number;
}

declare class PetBtnView extends egret.EventDispatcher {
    autoUse(): void;
}
