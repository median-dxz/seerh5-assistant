import { EventBus, GameNativeEmitter, Pet, debounce, getImageButtonListener, hookFn, hookPrototype } from 'sea-core';
import type { SEAMod } from '../../lib/mod';

class PetBag implements SEAMod.IModuleMod<petBag.PetBag> {
    declare logger: typeof console.log;

    meta: SEAMod.MetaData = {
        id: 'petBag',
        scope: 'median',
        type: 'module',
        description: '精灵背包模块注入, 提供UI同步和本地皮肤功能的UI支持',
    };

    moduleName = 'petBag';
    eventBus = new EventBus();
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
        const initBagView = debounce(() => PetManager.updateBagInfo(() => panel.updateBagView()), 600);
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
        const socketEmitter = this.eventBus.proxy(GameNativeEmitter.socket);
        const egretEmitter = this.eventBus.proxy(GameNativeEmitter.egret);
        socketEmitter.on(CommandID.PET_DEFAULT, refresh);
        socketEmitter.on(CommandID.PET_RELEASE, refresh);
        egretEmitter.on('petBag.MainPanelTouchPetItemEnd', printTappingPetInfo);
    }
    destroy() {
        this.eventBus.unmount();
    }
}

export default PetBag;
