import {
    Mod,
    ModuleSubscriber,
    SAEngine,
    SAEntity,
    SAEventHandler,
    SaModuleLogger,
    defaultStyle,
    delay,
    getImageButtonListener,
    wrapper,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('LocalCloth', defaultStyle.mod);
const NullCallBack = () => {};
const StorageKey = 'LocalSkin';
type Serializer<T> = (data: T) => string;
type Deserializer<T> = (data: string) => T;

interface LocalStorageProxy<T> {
    clear(): void;
}

// function createLocalStorageProxy<T>(
//     key: string,
//     defaultValue: T,
//     serializer: Serializer<T>,
//     deserializer: Deserializer<T>
// ): LocalStorageProxy<T> & T {
//     const serializedData = localStorage.getItem(key);
//     let data: T = defaultValue;
//     if (serializedData !== null) {
//         data = deserializer(serializedData);
//     }

//     const proxy = new Proxy(data, {
//         set(target, prop, value) {
//             target[prop] = value;
//             localStorage.setItem(key, serializer(data));
//             return true;
//         },
//         get(target, prop) {
//             if (typeof target[prop] === 'undefined') {
//                 const serializedData = localStorage.getItem(key);
//                 if (serializedData !== null) {
//                     data = deserializer(serializedData);
//                 }
//             }
//             return target[prop];
//         },
//     });

//     return {
//         ...proxy,
//         clear() {
//             localStorage.removeItem(key);
//         },
//     };
// }

interface SkinInfo {
    skinId: number;
    petSkinId: number;
}

let item;
let clothArray: [Array<[number, SkinInfo]> | null, Array<[number, number]> | null] = [null, null];

item = window.localStorage.getItem('LocalSkin');
if (item) {
    clothArray = JSON.parse(item);
}

const changeCloth = new Map<number, SkinInfo>(clothArray[0]);
const originalCloth = new Map<number, number>(clothArray[1]);
let refresh: null | CallBack = null;

function saveToStorage() {
    clothArray = [Array.from(changeCloth.entries()), Array.from(originalCloth.entries())];
    window.localStorage.setItem('LocalSkin', JSON.stringify(clothArray));
}

const logTapPetInfo = (e: egret.TouchEvent) => {
    const { petInfo } = e.data as { petInfo: PetInfo };
    petInfo && log(new SAEntity.Pet(petInfo));
};

declare var StatLogger: any;

class LocalCloth extends Mod {
    subscriber: ModuleSubscriber<petBag.PetBag> = {
        load() {
            let protoFunc: AnyFunction;
            protoFunc = petBag.SkinView.prototype.onChooseSkin;
            petBag.SkinView.prototype.onChooseSkin = wrapper(
                protoFunc,
                undefined,
                function (this: typeof petBag.SkinView) {
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
                        ? ((this.txt1.text = '默认形象'), (this.txt2.text = ''), (this.txt3.text = '原型精灵:' + n))
                        : ((this.txt1.text = r + '皮肤：' + a),
                          (this.txt2.text = '原型精灵:' + n),
                          void 0 === t.type
                              ? (this.txt3.text = '精灵经典形象')
                              : t.shopId
                              ? (this.txt3.text = '购买获得')
                              : t.go || t.goType
                              ? (this.txt3.text = '兑换获得')
                              : (this.txt3.text = '通过限时活动获得'));
                }
            );
            if (GuideManager.isCompleted()) {
                petBag.MainPanel.prototype.checkChangePosition = checkChangePosition;
            }
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

            let listener;

            listener = getImageButtonListener(panel.btnIntoStorage);
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
                if (panel.beginPetInfo == null && !petBag.ChangePetPop.changeFlag) {
                    // 非ui操作, 是直接发包
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
            EventManager.addEventListener('petBag.MainPanelTouchPetItemBegin', logTapPetInfo, null);
        },
    };
    meta = { description: '本地全皮肤解锁', id: 'petBag' };
    init() {
        Object.defineProperty(FighterUserInfo.prototype, 'petInfoArr', {
            get: function () {
                return this._petInfoArr;
            },
            set: function (t) {
                const skinId = (r: any) => (this.id == MainManager.actorID ? r.skinId : r._skinId ?? 0);
                (this._petInfoArr = t),
                    (this._petIDArr = []),
                    (this._petCatchArr = []),
                    (this._petSkillIDArr = []),
                    (this._aliveNum = 0);
                for (var e = 0, n = this._petInfoArr; e < n.length; e++) {
                    var r = n[e],
                        o = PetFightSkinSkillReplaceXMLInfo.getSkills(this.id == skinId(r), r.id),
                        i = r.id;
                    (i = PetIdTransform.getPetId(i, r.catchTime, !0)),
                        0 != skinId(r) && (i = PetSkinXMLInfo.getSkinPetId(skinId(r), r.id)),
                        this._petIDArr.push(i),
                        this._petCatchArr.push(r.catchTime);
                    for (var s = 0, _ = r.skillArray; s < _.length; s++) {
                        var a = _[s];
                        a instanceof PetSkillInfo
                            ? this.add2List(this._petSkillIDArr, a.id, o)
                            : this.add2List(this._petSkillIDArr, a, o);
                    }
                    var c = SkillXMLInfo.getHideSkillId(r.id);
                    16689 == c && (c = 16839),
                        this.add2List(this._petSkillIDArr, c, o),
                        r.hideSKill && this.add2List(this._petSkillIDArr, r.hideSKill.id, o),
                        r.hp > 0 && this._aliveNum++;
                }
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(FightPetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this._petID) && this.userID == MainManager.actorID
                    ? changeCloth.get(this._petID)!.skinId
                    : this._skinId;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this.id) ? changeCloth.get(this.id)!.skinId : this._skinId ?? 0;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        PetManager.equipSkin = async function (catchTime, skinId, callback) {
            let _skinId = skinId ?? 0;
            let petInfo = PetManager.getPetInfo(catchTime);
            log('new skin id:', _skinId, 'previous skin id:', petInfo.skinId);
            if (
                (_skinId === 0 || PetSkinController.instance.haveSkin(_skinId)) &&
                (!originalCloth.has(petInfo.id) || originalCloth.get(petInfo.id) !== _skinId)
            ) {
                changeCloth.delete(petInfo.id);
                originalCloth.set(petInfo.id, _skinId);
                saveToStorage();
                await SAEngine.Socket.sendByQueue(47310, [catchTime, skinId]);
            } else {
                if (!originalCloth.has(petInfo.id)) {
                    originalCloth.set(petInfo.id, petInfo.skinId);
                }
                changeCloth.set(petInfo.id, {
                    skinId: _skinId,
                    petSkinId: PetSkinXMLInfo.getSkinPetId(_skinId, petInfo.id),
                });
                saveToStorage();
            }
            petInfo = PetManager.getPetInfo(catchTime);
            petInfo.skinId = _skinId;
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, catchTime, _skinId));
            callback && callback();
        };

        SAEventHandler.SeerModuleStatePublisher.attach(this.subscriber, 'petBag');
        console.log('here');
    }
    destroy() {
        SAEventHandler.SeerModuleStatePublisher.detach(this.subscriber, 'petBag');
    }
}

async function checkChangePosition(this: petBag.MainPanel) {
    return (async () => {
        if (!this.beginPetInfo || this.beginPetInfo == this.endPetInfo) {
            return;
        }

        if (!this.endPetInfo) {
            let arr1 = this.arrFirstPet;
            let arr2 = this.arrSecondPet;
            let srcIndex = -1;
            for (let i = 0; i < 6; i++) {
                if (this.arrFirstPet[i].petInfo == this.beginPetInfo) {
                    if (this.endParent == this.groupPet2) {
                        srcIndex = i;
                        await PetManager.bagToSecondBag(this.beginPetInfo.catchTime);
                        if (i == 0 && this.arrFirstPet[1].petInfo) {
                            PetManager.setDefault(this.arrFirstPet[1].petInfo.catchTime);
                        }
                    }
                    break;
                }
                if (this.arrSecondPet[i].petInfo == this.beginPetInfo) {
                    if (this.endParent == this.groupPet1) {
                        srcIndex = i;
                        await PetManager.secondBagToBag(this.beginPetInfo.catchTime);
                        if (this.arrFirstPet[0].petInfo == undefined) {
                            PetManager.setDefault(this.beginPetInfo.catchTime);
                        }
                        [arr1, arr2] = [arr2, arr1];
                    }
                    break;
                }
            }
            if (srcIndex === -1) {
                return;
            }
            for (let i = srcIndex; i < arr1.length - 1; i++) {
                arr1[i].setPetInfo(arr1[i + 1].petInfo);
            }
            arr1[arr1.length - 1].setPetInfo(null);

            let destIndex = arr2.findIndex((el) => el.petInfo === null);
            arr2[destIndex].setPetInfo(this.beginPetInfo);

            if (PetManager.secondBagTotalLength < 6) {
                for (let i = PetManager.secondBagTotalLength; i < 6; i++) {
                    this.arrSecondPet[i].setPetInfo(null, i);
                }
            }
        } else {
            const combined = this.arrFirstPet.concat(this.arrSecondPet);

            let index1 = -1;
            let index2 = -1;
            for (let i = 0; i < combined.length; i++) {
                if (combined[i].petInfo === this.beginPetInfo) {
                    index1 = i;
                }
                if (combined[i].petInfo === this.endPetInfo) {
                    index2 = i;
                }
                if (index1 !== -1 && index2 !== -1) {
                    break;
                }
            }

            const temp = combined[index1].petInfo;
            combined[index1].setPetInfo(combined[index2].petInfo);
            combined[index2].setPetInfo(temp);

            if (this.endParent === this.groupPet1 && index1 >= 6) {
                await PetManager.bagToStorage(this.endPetInfo.catchTime);
                await PetManager.secondBagToBag(this.beginPetInfo.catchTime);
                await PetManager.storageToSecondBag(this.endPetInfo.catchTime);
            } else if (this.endParent === this.groupPet2 && index1 < 6) {
                await PetManager.bagToStorage(this.beginPetInfo.catchTime);
                await PetManager.secondBagToBag(this.endPetInfo.catchTime);
                await PetManager.storageToSecondBag(this.beginPetInfo.catchTime);
            }
            if (index2 === 0) {
                PetManager.setDefault(this.beginPetInfo.catchTime);
            }
            if (index1 === 0) {
                PetManager.setDefault(this.endPetInfo.catchTime);
            }
        }
    })().then(() => {
        this.beginPetInfo && EventManager.dispatchEventWith('petBag.MainPanelSelectPet', !1, this.beginPetInfo);
        this.beginPetInfo = this.endPetInfo = this.endParent = null;
    });
}

export default LocalCloth;
