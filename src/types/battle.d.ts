declare namespace PetFightController {
    const roundTimes: number;
    function setup(): void;
}

declare namespace FighterModelFactory {
    var playerMode: BaseFighterModel | undefined;
    var enemyMode: BaseFighterModel | undefined;
}

declare class BaseFighterModel {
    setHpView: (show: boolean) => void;
    skillBtnViews: Array<SkillBtnView>;
    subject: SAType.ObserverList<ToolBtnPanelObserver>;
    info: {
        petName: string;
    };
    propView: PropView; //TODO
}

declare class ToolBtnPanelObserver {
    showPet(): void;
    petPanel: PetSelectPanel;
    showFight(): void;
    itemPanel: FightItemPanel;
    showItem(index: number): void;
}

declare class PropView {
    //TODO
    get isShowFtHp(): boolean;
    set isShowFtHp(showFtHp: boolean);
    dispatchNoBlood: boolean;
}

declare class SkillBtnView {
    //TODO
    get skillID(): number;
    get pp(): number;
}

declare class PetBtnView {
    //TODO
    autoUse(): void;
}

declare class FightItemPanel {
    //TODO
    onUseItem(itemID: number): void;
}

declare class PetSelectPanel {
    //TODO
    _petsArray: Array<PetBtnView>;
}
