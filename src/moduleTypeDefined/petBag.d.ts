declare namespace petBag {
    class PetBag extends BasicMultPanelModule {}
    class MainPanel extends BasicPanel {
        onSelectPet(event: Pick<egret.Event, 'data'>): void;
        showDevelopBaseView(): void;
        showDevelopView(view: number): void;
    }
    var MainPanelPetItem: any;
    var SkinView: any;
}
