import { scope } from '@/median/constants.json';
import { Pet, SEAEventSource, Subscription, debounce, engine, hookFn, hookPrototype } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

declare module '@sea/core' {
    interface GameModuleMap {
        petBag: petBag.PetBag;
    }
}

export const metadata = {
    id: 'PetBag',
    scope,
    description: '精灵背包模块注入, 提供UI同步和本地皮肤功能的UI支持',
    version: '1.0.0'
} satisfies SEAModMetadata;

export default async function PetBag({ logger }: SEAModContext<typeof metadata>): Promise<SEAModExport> {
    const sub = new Subscription();
    const lifeCycleSub = new Subscription();

    const load = () => {
        // 开启本地换肤按钮
        hookPrototype(petBag.SkinView, 'onChooseSkin', function (f, ...args) {
            f.call(this, ...args);
            const skinId = this.arrayCollection.getItemAt(this.selectSkinIndex)?.id ?? 0;
            if (skinId) {
                this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
            }
        });
    };

    const mainPanel = (ctx: petBag.PetBag) => {
        const panel = ctx.panelMap['petBag.MainPanel'] as petBag.MainPanel;
        const listener = engine.imageButtonListener(panel.btnIntoStorage);
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
            petInfo && logger(new Pet(petInfo));
        };
        sub.on(SEAEventSource.socket(CommandID.PET_DEFAULT, 'receive'), refresh);
        sub.on(SEAEventSource.socket(CommandID.PET_RELEASE, 'receive'), refresh);
        sub.on(SEAEventSource.egret<egret.TouchEvent>('petBag.MainPanelTouchPetItemEnd'), printTappingPetInfo);
    };

    const install = () => {
        lifeCycleSub.on(SEAEventSource.gameModule('petBag', 'load'), load);
        lifeCycleSub.on(SEAEventSource.gameModule('petBag', 'mainPanel'), mainPanel);
        lifeCycleSub.on(SEAEventSource.gameModule('petBag', 'destroy'), () => sub.dispose());
    };

    const uninstall = () => {
        lifeCycleSub.dispose();
    };

    return {
        install,
        uninstall
    };
}
