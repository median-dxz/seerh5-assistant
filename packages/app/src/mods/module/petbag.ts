import { ModuleMod } from '@sa-app/mod-manager/mod-type';
import { SAEngine, SAEntity, debounce, hook, hookPrototype, SAEvent } from 'seerh5-assistant-core';

const { SAEventBus } = SAEvent;

class LocalCloth extends ModuleMod<petBag.PetBag> {
    moduleName = 'petBag';
    meta = { id: 'SA::ModuleMod::PetBag', description: '精灵背包模块注入' };

    eventBus = new SAEventBus();

    load() {
        // 开启本地换肤按钮
        hookPrototype(petBag.SkinView, 'onChooseSkin', function (f, ...args) {
            f.call(this, ...args);
            let skinId = this.arrayCollection.getItemAt(this.selectSkinIndex)?.id ?? 0;
            if (skinId) {
                this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
            }
        });
    }

    mainPanel(ctx: petBag.PetBag) {
        const panel = ctx.panelMap['petBag.MainPanel'] as petBag.MainPanel;

        const listener = SAEngine.getImageButtonListener(panel.btnIntoStorage);

        hook(listener, 'callback', function (f) {
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
            petInfo && this.log(new SAEntity.Pet(petInfo));
        };

        this.eventBus.socket(CommandID.PET_DEFAULT, refresh);
        this.eventBus.socket(CommandID.PET_RELEASE, refresh);
        this.eventBus.egret('petBag.MainPanelTouchPetItemEnd', printTappingPetInfo);
    }

    _destroy(): void {
        this.eventBus.unmount();
    }
}

export default LocalCloth;
