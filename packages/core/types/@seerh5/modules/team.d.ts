declare global {
    namespace team {
        class TeamTech extends BaseModule {
            list_attr: eui.List;
            _costNum: number;
            _petInfo: PetInfo;
            getMax(index: number): number;
            getNeedCost(index: number): number;
            onClickEnhance(): void;
            updateData(): void;
            showPetDetail(): void;
            onTouchAttr(): void;
        }
    }
}

export {};
