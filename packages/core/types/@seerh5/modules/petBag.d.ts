declare global {
    namespace petBag {
        class PetBag extends BasicMultPanelModule {
            currentPanel?: MainPanel;
        }

        class MainPanel extends BasicPanel {
            onSelectPet(event: Pick<egret.Event, 'data'>): void;
            showDevelopBaseView(): void;
            showDevelopView(view: number): void;
            updateBagView(): void;
            checkChangePosition(): Promise<void>;
            beginPetInfo: PetInfo | null;
            endPetInfo: PetInfo | null;
            arrFirstPet: petBag.MainPanelPetItem[];
            arrSecondPet: petBag.MainPanelPetItem[];
            btnChange: eui.UIComponent;
            btnIntoStorage: eui.UIComponent;
            endParent: any;
            groupPet1: any;
            groupPet2: any;
        }

        class MainPanelPetItem {
            petInfo: PetInfo;
            setPetInfo(petInfo: PetInfo | null, index?: number): void;
        }

        class SkinView {
            onChooseSkin(): void;
            arrayCollection: any;
            selectSkinIndex: number;
            petInfo: PetInfo;
            btnPutOn: any;
            imgHasPutOn: any;
        }

        var ChangePetPop: any;
    }
}

export {};
