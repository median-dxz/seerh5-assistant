import {
    Mod,
    ModuleSubscriber,
    SAEngine,
    SAEntity,
    SAEventHandler,
    SaModuleLogger,
    defaultStyle,
    delay,
    wrapper,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('PetBagModule', defaultStyle.mod);

let refresh: null | CallBack = null;

const logTapPetInfo = (e: egret.TouchEvent) => {
    const { petInfo } = e.data as { petInfo: PetInfo };
    petInfo && log(new SAEntity.Pet(petInfo));
};

class LocalCloth extends Mod {
    meta = { description: 'PetBag模块注入', id: 'petBag' };
    subscriber: ModuleSubscriber<petBag.PetBag> = {
        load() {
            let protoFunc = petBag.SkinView.prototype.onChooseSkin;
            petBag.SkinView.prototype.onChooseSkin = wrapper(
                protoFunc,
                undefined,
                function (this: typeof petBag.SkinView) {
                    const t = this.arrayCollection.getItemAt(this.selectSkinIndex);
                    if (t) {
                        let skinId = t.id ?? 0;
                        this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                        this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
                    }
                }
            );
        },
        destroy(ctx) {
            if (refresh) {
                SocketConnection.removeCmdListener(CommandID.PET_RELEASE, refresh);
            }
            EventManager.removeEventListener('petBag.MainPanelTouchPetItemBegin', logTapPetInfo, null);
        },
        async show(ctx) {
            await delay(200); //等待panel实例化
            let timerId: null | number = null;
            const panel = ctx.panelMap['petBag.MainPanel'] as petBag.MainPanel;

            let listener = SAEngine.getImageButtonListener(panel.btnIntoStorage);
            listener.callback = wrapper(
                listener.callback,
                () => {
                    panel.beginPetInfo = panel.arrFirstPet[0].petInfo;
                },
                () => {
                    panel.beginPetInfo = null;
                }
            );

            refresh = (e: SocketEvent) => {
                // 非ui操作, 是直接发包
                if (panel.beginPetInfo == null && !petBag.ChangePetPop.changeFlag) {
                    // 则固定延时后执行刷新
                    if (timerId) {
                        clearTimeout(timerId);
                        timerId = null;
                    }
                    timerId = window.setTimeout(() => {
                        panel.initBagView();
                    }, 600);
                }
            };

            SocketConnection.addCmdListener(CommandID.PET_RELEASE, refresh);
            EventManager.addEventListener('petBag.MainPanelTouchPetItemEnd', logTapPetInfo, null);
        },
    };
    init() {
        SAEventHandler.SeerModuleStatePublisher.attach(this.subscriber, 'petBag');
    }

    /** unsupported now */
    destroy() {
        SAEventHandler.SeerModuleStatePublisher.detach(this.subscriber, 'petBag');
    }
}

export default LocalCloth;
