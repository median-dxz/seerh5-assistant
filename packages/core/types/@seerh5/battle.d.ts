declare global {
    interface PetFightController {
        roundTimes: number;
        GameSpeed: number;
        onStartFight(t: unknown): void;
        mvContainer: egret.DisplayObjectContainer;
    }
    const PetFightController: PetFightController;

    interface FightOverController {
        destroy(): void;
    }
    const FightOverController: FightOverController;

    interface FightNoteCmdListener {
        isInFightModule: boolean;
        startFight(evt: PetFightEvent): void;
    }
    const FightNoteCmdListener: FightNoteCmdListener;

    interface TimerManager {
        countDownOverHandler(): void;
    }
    const TimerManager: TimerManager;

    interface TimeScaleManager {
        setBattleAnimateSpeed(speed: number): void;
    }
    const TimeScaleManager: TimeScaleManager;

    class UseSkillController extends egret.EventDispatcher {
        textTimer: egret.Timer | null;
        closeTxt(): void;
        onMovieOver(): void;
    }

    interface FighterModelFactory {
        playerMode?: PlayerModel;
        enemyMode?: BaseFighterModel;
    }
    const FighterModelFactory: FighterModelFactory;

    class PlayerModel extends BaseFighterModel {
        nextRound(): void;
    }

    class BaseFighterModel extends egret.EventDispatcher {
        setHpView: (show: boolean) => void;
        skillBtnViews: Array<SkillBtnView>;
        subject: seerh5.ObserverList<ToolBtnPanelObserver>;
        get info(): FightPetInfo;
        get propView(): BaseFighterPropView;
    }

    class RenewPPEffect {
        constructor(model: BaseFighterModel, itemId: number);
        timer: egret.Timer | null;
        closeTxt(): void;
    }

    class ToolBtnPanelObserver {
        skillPanel: SkillPanel;
        showPet(): void;
        petPanel: PetSelectPanel;
        showFight(): void;
        itemPanel: FightItemPanel;
        showItem(index: number): void;
        currPanelType: panel_type;
    }

    enum panel_type {
        itemPanel = 2,
        petPanel = 1,
        skillPanel = 0,
    }

    class BaseControlPanel extends egret.EventDispatcher {}

    class SkillPanel extends BaseControlPanel {
        auto(): void;
    }

    class PetSelectPanel extends BaseControlPanel {
        _petsArray: Array<PetBtnView>;
    }

    class FightItemPanel extends BaseControlPanel {
        onUseItem(itemID: number): void;
    }

    class BaseFighterPropView {
        get isShowFtHp(): boolean;
        set isShowFtHp(showFtHp: boolean);
        dispatchNoBlood: boolean;
    }

    class SkillBtnView extends egret.EventDispatcher {
        autoUse(): void;
        get skillID(): number;
        get pp(): number;
    }

    class PetBtnView extends egret.EventDispatcher {
        info: PetInfo;
        locked: boolean;
        catchTime: number;
        hp: number;
        autoUse(): void;
        getMC(): petMC;
        mc: petMC;
    }

    class petMC extends eui.Component {
        selected: boolean;
    }
}

export { };

