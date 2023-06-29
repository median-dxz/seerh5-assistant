import { Pet, SAEventBus, debounce, getImageButtonListener, hookFn, hookPrototype } from 'sa-core';

class PetBag implements SAMod.IModuleMod<petBag.PetBag> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'petBag',
        author: 'median',
        type: 'module',
        description: '精灵背包模块注入, 提供UI同步和本地皮肤功能的UI支持',
    };

    moduleName = 'petBag';
    eventBus = new SAEventBus();
    load() {
        // 开启本地换肤按钮
        hookPrototype(petBag.SkinView, 'onChooseSkin', function (f, ...args) {
            f.call(this, ...args);
            const skinId = this.arrayCollection.getItemAt(this.selectSkinIndex)?.id ?? 0;
            if (skinId) {
                this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
            }
        });
    }
    mainPanel(ctx: petBag.PetBag) {
        const panel = ctx.panelMap['petBag.MainPanel'] as petBag.MainPanel;
        const listener = getImageButtonListener(panel.btnIntoStorage);
        hookFn(listener, 'callback', function (f) {
            panel.beginPetInfo = panel.arrFirstPet[0].petInfo;
            f.call(listener);
            panel.beginPetInfo = null;
        });
        const initBagView = debounce(() => {
            panel.initBagView();
        }, 600);
        const refresh = () => {
            // 非ui操作, 是直接发包
            if (panel.beginPetInfo == null && !petBag.ChangePetPop.changeFlag) {
                initBagView();
            }
        };
        const printTappingPetInfo = (e: egret.TouchEvent) => {
            const { petInfo } = e.data as { petInfo: PetInfo };
            petInfo && this.logger(new Pet(petInfo));
        };
        this.eventBus.socket(CommandID.PET_DEFAULT, refresh);
        this.eventBus.socket(CommandID.PET_RELEASE, refresh);
        this.eventBus.egret('petBag.MainPanelTouchPetItemEnd', printTappingPetInfo);
    }
    destroy() {
        this.eventBus.unmount();
    }
}

export default PetBag;
