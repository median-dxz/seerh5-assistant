import { SAEngine, SAEntity, SAMod, debounce, hook, hookPrototype } from 'seerh5-assistant-core';

class LocalCloth extends SAMod.ModuleMod<petBag.PetBag> {
    moduleName = 'petBag';
    meta = { id: 'SA::ModuleMod::PetBag', description: '精灵背包模块注入' };

    callback: Record<string, CallBack> = {};

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

        this.callback.refresh = () => {
            // 非ui操作, 是直接发包
            if (panel.beginPetInfo == null && !petBag.ChangePetPop.changeFlag) {
                initBagView();
            }
        };
        this.callback.printTappingPetInfo = (e: egret.TouchEvent) => {
            const { petInfo } = e.data as { petInfo: PetInfo };
            petInfo && this.log(new SAEntity.Pet(petInfo));
        };

        SocketConnection.addCmdListener(CommandID.PET_RELEASE, this.callback.refresh);
        EventManager.addEventListener('petBag.MainPanelTouchPetItemEnd', this.callback.printTappingPetInfo, null);
    }

    _destroy(): void {
        SocketConnection.removeCmdListener(CommandID.PET_RELEASE, this.callback.refresh);
        EventManager.removeEventListener('petBag.MainPanelTouchPetItemBegin', this.callback.printTappingPetInfo, null);
    }
}

export default LocalCloth;
