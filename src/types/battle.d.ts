declare class PetFightController {
    static roundTimes: number;
    static setup(): void;
}

declare class FighterModelFactory {
    static playerMode?: BaseFighterModel;
    static enemyMode?: BaseFighterModel;
}

declare class BaseFighterModel {
    setHpView: (show: boolean) => void;
    skillBtnViews: Array<SkillBtnView>;
    subject: SAType.ObserverList<ToolBtnPanelObserver>;
    get info(): FightPetInfo;
    get propView(): BaseFighterPropView;
}

declare class ToolBtnPanelObserver {
    showPet(): void;
    petPanel: PetSelectPanel;
    showFight(): void;
    itemPanel: FightItemPanel;
    showItem(index: number): void;
}

declare class BaseControlPanel extends egret.EventDispatcher {}

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

declare class TimerManager {
    static countDownOverHandler(): void;
}
