declare namespace petBag {
    class PetBag extends BasicMultPanelModule {
        currentPanel?: MainPanel;
    }
    class MainPanel extends BasicPanel {
        onSelectPet(event: Pick<egret.Event, 'data'>): void;
        showDevelopBaseView(): void;
        showDevelopView(view: number): void;
        initBagView(): void;
        checkChangePosition(): Promise<void>;
        uiChangePetFlag: boolean;
    }
    var MainPanelPetItem: any;
    var SkinView: any;
}
