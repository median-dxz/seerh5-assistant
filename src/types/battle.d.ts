declare namespace PetFightController {
    const roundTimes: number;
    function setup(): void;
}

declare namespace FighterModelFactory {
    var playerMode: BaseFighterModel | undefined;
    var enemyMode: BaseFighterModel | undefined;
}

declare class BaseFighterModel {
    setHpView: (this: BaseFighterModel, show: boolean) => void;
    skillBtnViews: Array<SkillBtnView>;
    subject: SAType.ObserverList<ToolBtnPanelObserver>;
    info: {
        petName: string;
    };
    propView: PropView;
}

declare class ToolBtnPanelObserver {
    showPet(): void;
    petPanel: PetSelectPanel;
    showFight(): void;
    itemPanel: FightItemPanel;
    showItem(index: number): void;
}

declare class PropView {
    get isShowFtHp(): boolean;
    set isShowFtHp(showFtHp: boolean);
    dispatchNoBlood: boolean;
}

declare class SkillBtnView {
    get skillID(): number;
    get pp(): number;
}

declare class PetBtnView {
    autoUse(): void;
}

declare class FightItemPanel {
    onUseItem(itemID: number): void;
}

declare class PetSelectPanel {
    _petsArray: Array<PetBtnView>;
}
