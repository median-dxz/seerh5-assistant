import * as saco from '../../assistant/core';
import Pet from '../../assistant/entities/pet';
import { ReflectObjBase } from '../../assistant/modloader';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('LocalCloth', defaultStyle.mod);

const { Const, Utils } = saco;
const { EVENTS: SAEvents } = Const;
const { wrapper, SAEventTarget } = window;

const changeCloth = new Map();
const originalCloth = new Map();

class LocalCloth extends ReflectObjBase implements ModClass {
    constructor() {
        super();
        Object.defineProperty(FighterUserInfos.prototype, 'allPetID', {
            get: function () {
                if (this.myInfo && this.otherInfo)
                    this._allPetID = this.myInfo.petIDArr.concat(this.otherInfo.petIDArr);
                this._allPetID = this._allPetID.map((v: any) =>
                    changeCloth.has(v) ? changeCloth.get(v).petSkinId : v
                );
                return this._allPetID;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(FightPetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this._petID) ? changeCloth.get(this._petID).skinId : this._skinId;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this.id) ? changeCloth.get(this.id).skinId : this._skinId ?? 0;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        PetManager.equipSkin = async function (e: number, n: number, r?: () => any) {
            let _skinId = n ?? 0;
            let petInfo = PetManager.getPetInfo(e);
            log('new skin id:', _skinId, 'previous skin id:', petInfo.skinId);
            if (
                (_skinId === 0 || PetSkinController.instance.haveSkin(_skinId)) &&
                (!originalCloth.has(petInfo.id) || originalCloth.get(petInfo.id) !== _skinId)
            ) {
                changeCloth.delete(petInfo.id);
                originalCloth.set(petInfo.id, _skinId);
                await new Promise<void>((resolve, reject) => {
                    Utils.SocketSendByQueue(47310, [e, n]).then((v) => {
                        resolve();
                    });
                });
            } else {
                if (!originalCloth.has(petInfo.id)) {
                    originalCloth.set(petInfo.id, petInfo.skinId);
                }
                changeCloth.set(petInfo.id, {
                    skinId: _skinId,
                    petSkinId: PetSkinXMLInfo.getSkinPetId(_skinId, petInfo.id),
                });
            }
            petInfo = PetManager.getPetInfo(e);
            petInfo.skinId = _skinId;
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, e, _skinId));
            r && r();
        };

        const petBagModuleLoaded = (e: Event) => {
            if ((e as CustomEvent).detail.moduleName === 'petBag') {
                let petBag: any;
                SAEventTarget.addEventListener(
                    SAEvents.Module.show,
                    () => {
                        petBag = window['petBag' as any];
                        let protoFunc = petBag.PetBag.prototype.onEndDrag;
                        petBag.PetBag.prototype.onEndDrag = wrapper(protoFunc, null, function (this: any) {
                            log(new Pet(this.hitHead.petInfo));
                        });

                        protoFunc = petBag.SkinView.prototype.onChooseSkin;
                        petBag.SkinView.prototype.onChooseSkin = wrapper(protoFunc, null, function (this: any) {
                            const t = this.arrayCollection.getItemAt(this.selectSkinIndex);
                            let skinId = 0;
                            if (t) {
                                if (t.id) {
                                    EventManager.dispatchEventWith('petBag.SkinViewChangeSkin', !1, t.skinPetId);
                                }
                                skinId = t.id ?? 0;
                                this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                                this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
                            }

                            const n = PetXMLInfo.getName(t.monId),
                                r = PetSkinXMLInfo.getTypeCn(t.type),
                                a = t.name,
                                o = 0 === t.type;
                            o
                                ? ((this.txt1.text = '默认形象'),
                                  (this.txt2.text = ''),
                                  (this.txt3.text = '原型精灵:' + n))
                                : ((this.txt1.text = r + '皮肤：' + a),
                                  (this.txt2.text = '原型精灵:' + n),
                                  void 0 === t.type
                                      ? (this.txt3.text = '精灵经典形象')
                                      : t.shopId
                                      ? (this.txt3.text = '购买获得')
                                      : t.go || t.goType
                                      ? (this.txt3.text = '兑换获得')
                                      : (this.txt3.text = '通过限时活动获得'));
                            // this.txt_line2.text =
                            //     `精灵ID: ${t.monId}\n` +
                            //     `皮肤ID: ${t.id}\n` +
                            //     `皮肤绑定ID: ${PetSkinXMLInfo.getSkinPetId(t.id, t.monId)}`;
                        });
                    },
                    { once: true }
                );
                SAEventTarget.removeEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
            }
        };
        SAEventTarget.addEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
    }

    meta = { description: '本地全皮肤解锁' };
    init() {}
}

export default {
    mod: LocalCloth,
};
