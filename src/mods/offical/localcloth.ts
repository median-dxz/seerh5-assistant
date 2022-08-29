import * as saco from '../../assisant/core';
import Pet from '../../assisant/entities/pet';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('LocalCloth', defaultStyle.mod);

const { Const, Utils } = saco;
const { EVENTS: SAEvents } = Const;
const { warpper, SAEventTarget } = window;

const changeCloth = new Map();
const origalCloth = new Map();

class LocalCloth {
    constructor() {
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
                (!origalCloth.has(petInfo.id) || origalCloth.get(petInfo.id) !== _skinId)
            ) {
                changeCloth.delete(petInfo.id);
                origalCloth.set(petInfo.id, _skinId);
                await new Promise<void>((resolve, reject) => {
                    Utils.SocketSendByQueue(47310, [e, n]).then((v) => {
                        resolve();
                    });
                });
            } else {
                if (!origalCloth.has(petInfo.id)) {
                    origalCloth.set(petInfo.id, petInfo.skinId);
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
        const petDetailInfoModuleLoaded = (e: Event) => {
            let petDetailedInfo: any;
            if ((e as CustomEvent).detail.moduleName === 'petDetailedInfo') {
                SAEventTarget.addEventListener(
                    SAEvents.Module.show,
                    () => {
                        petDetailedInfo = window['petDetailedInfo' as any];
                        const protoFunc = petDetailedInfo.PetInfoSkinView.prototype.updateSkin;
                        petDetailedInfo.PetInfoSkinView.prototype.updateSkin = warpper(protoFunc, null, function () {
                            const t = this._arry.getItemAt(this._selectSkinIndex);
                            this.txt_line2.text =
                                `                    精灵ID: ${t.monId}\n` +
                                `                    皮肤ID: ${t.id}\n` +
                                `                    皮肤绑定ID: ${PetSkinXMLInfo.getSkinPetId(t.id, t.monId)}`;
                            this.img_yzb.visible =
                                (this._petInfo.skinId === 0 && !t.id) || this._petInfo.skinId === t.id;
                            this.img_zhuangbei.visible = !this.img_yzb.visible;
                        });
                        petDetailedInfo.ItemSkin.prototype.dataChanged = function () {
                            var e = this;
                            if (!this.data) return void (this.visible = !1);
                            (this.visible = !0), (this.lab_name.text = this.data.name);
                            var t = this.data.type;
                            this.img_ys.source = 'common_pet_skin_icon_' + t + '_png';
                            this.icon_skin.visible = this._petShow.visible = !1;
                            e.icon_skin.source = ClientConfig.getPetHalfIcon(
                                this.data.monId == this.data.skinPetId || this.data.skinPetId >= 14e5
                                    ? this.data.skinPetId
                                    : 14e5 + this.data.id
                            );
                            e.icon_skin.visible = true;
                        };
                    },
                    { once: true }
                );
                SAEventTarget.removeEventListener(SAEvents.Module.loaded, petDetailInfoModuleLoaded);
            }
        };
        SAEventTarget.addEventListener(SAEvents.Module.loaded, petDetailInfoModuleLoaded);

        const petBagModuleLoaded = (e: Event) => {
            if ((e as CustomEvent).detail.moduleName === 'petBag') {
                let petBag: any;
                SAEventTarget.addEventListener(
                    SAEvents.Module.show,
                    () => {
                        petBag = window['petBag' as any];
                        const protoFunc = petBag.PetBag.prototype.onEndDrag;
                        petBag.PetBag.prototype.onEndDrag = warpper(protoFunc, null, function () {
                            log(new Pet(this.hitHead.petInfo));
                        });
                    },
                    { once: true }
                );
                SAEventTarget.removeEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
            }
        };
        SAEventTarget.addEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
    }
    init() {}
}

export default {
    mod: LocalCloth,
};
