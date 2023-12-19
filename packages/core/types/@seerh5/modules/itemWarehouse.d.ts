declare global {
    namespace itemWarehouse {
        class ItemWarehouse extends BaseModule {
            onCompose(): void;
            onShowPetFactorInfo(): void;
            txtMsg_kb_3: eui.Label;
            txtTexing: eui.Label;
            txtPetname: eui.Label;
            btnhecheng: eui.Button;
            _list: eui.List;
            _petFactorPage: number;
        }
    }
}

export {};
