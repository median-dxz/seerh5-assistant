import * as saco from '../../proxy/core.js';
import data from '../common.config.js';

const { SAEventManager, Const, Utils } = saco;
const { EVENTS: SAEvents } = Const;

const changeCloth = new Map();
const origalCloth = new Map();

class LocalCloth {
    constructor() {
        Object.defineProperty(FighterUserInfos.prototype, 'allPetID', {
            get: function () {
                if (this.myInfo && this.otherInfo)
                    this._allPetID = this.myInfo.petIDArr.concat(this.otherInfo.petIDArr);
                this._allPetID = this._allPetID.map((v) => (changeCloth.has(v) ? changeCloth.get(v).petSkinId : v));
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
                return changeCloth.has(this.id) ? changeCloth.get(this.id).skinId : this._skinId;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        PetManager.equipSkin = async function (e, n, r) {
            let _skinId = n;
            let petInfo = PetManager.getPetInfo(e);
            void 0 === r && (r = null);
            console.log(n, petInfo.skinId);
            if (
                (PetSkinController.instance.haveSkin(n) || n === undefined) &&
                (!origalCloth.has(petInfo.id) || origalCloth.get(petInfo.id) !== n)
            ) {
                changeCloth.delete(petInfo.id);
                origalCloth.set(petInfo.id, n);
                await new Promise((resolve, reject) => {
                    SocketConnection.sendByQueue(47310, [e, n], function (o) {
                        resolve();
                    });
                });
            } else {
                if (!origalCloth.has(petInfo.id)) {
                    origalCloth.set(petInfo.id, petInfo.skinId);
                }
                changeCloth.set(petInfo.id, {
                    skinId: n,
                    petSkinId: PetSkinXMLInfo.getSkinPetId(n, petInfo.id),
                });
            }
            petInfo = PetManager.getPetInfo(e);
            petInfo.skinId = _skinId;
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, e, _skinId));
            null != r && r();
        };
        const petDetailInfoModuleLoaded = (e) => {
            if (e.detail.moduleName == 'petDetailedInfo') {
                SAEventManager.addEventListener(
                    SAEvents.Module.show,
                    () => {
                        const protoFunc = petDetailedInfo.PetInfoSkinView.prototype.updateSkin;
                        petDetailedInfo.PetInfoSkinView.prototype.updateSkin = SA.Utils.warpper(
                            protoFunc,
                            null,
                            function () {
                                const t = this._arry.getItemAt(this._selectSkinIndex);
                                this.txt_line2.text =
                                    `                    精灵ID: ${t.monId}\n` +
                                    `                    皮肤ID: ${t.id}\n` +
                                    `                    皮肤绑定ID: ${PetSkinXMLInfo.getSkinPetId(t.id, t.monId)}`;
                                this.img_yzb.visible =
                                    (this._petInfo.skinId == 0 && !t.id) || this._petInfo.skinId == t.id;
                                this.img_zhuangbei.visible = !this.img_yzb.visible;
                            }
                        );
                    },
                    { once: true }
                );
                SAEventManager.removeEventListener(SAEvents.Module.loaded, petDetailInfoModuleLoaded);
            }
        };
        SAEventManager.addEventListener(SAEvents.Module.loaded, petDetailInfoModuleLoaded);

        const petBagModuleLoaded = (e) => {
            if (e.detail.moduleName == 'petBag') {
                SAEventManager.addEventListener(
                    SAEvents.Module.show,
                    () => {
                        const protoFunc = petBag.PetBag.prototype.onEndDrag;
                        petBag.PetBag.prototype.onEndDrag = Utils.warpper(protoFunc, null, function () {
                            console.log(this.hitHead.petInfo);
                        });
                    },
                    { once: true }
                );
                SAEventManager.removeEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
            }
        };
        SAEventManager.addEventListener(SAEvents.Module.loaded, petBagModuleLoaded);
    }
    init() {}
}

export default {
    mod: LocalCloth,
};
