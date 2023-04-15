import {
    Mod,
    ModuleSubscriber,
    SAEngine,
    SAEntity,
    SAEventHandler,
    SaModuleLogger,
    createLocalStorageProxy,
    defaultStyle,
    delay,
    getImageButtonListener,
    wrapper,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('LocalCloth', defaultStyle.mod);

const NullCallBack = () => {};
const StorageKey = 'LocalSkin';

interface SkinInfo {
    skinId: number;
    petSkinId: number;
}

interface LocalSkinInfos {
    changed: Map<number, SkinInfo>;
    original: Map<number, number>;
}

const cloth = createLocalStorageProxy<LocalSkinInfos>(
    StorageKey,
    { changed: new Map(), original: new Map() },
    (data) => {
        const clothData = {
            changed: Array.from(data.changed.entries()),
            original: Array.from(data.original.entries()),
        };
        return JSON.stringify(clothData);
    },
    (serialized) => {
        const { changed, original } = JSON.parse(serialized);
        return { changed: new Map(changed), original: new Map(original) };
    }
);

let refresh: null | CallBack = null;

const logTapPetInfo = (e: egret.TouchEvent) => {
    const { petInfo } = e.data as { petInfo: PetInfo };
    petInfo && log(new SAEntity.Pet(petInfo));
};

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
                return cloth.changed.has(this._petID) && this.userID == MainManager.actorID
                    ? cloth.changed.get(this._petID)!.skinId
                    : this._skinId;
            },
        });
        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function (this: PetInfo) {
                return cloth.changed.has(this.id) ? cloth.changed.get(this.id)!.skinId : this._skinId ?? 0;
            },
        });
        PetManager.equipSkin = async function (catchTime, skinId = 0, callback = NullCallBack) {
            let petInfo = PetManager.getPetInfo(catchTime);
            log('new skin id:', skinId, 'previous skin id:', petInfo.skinId);
            if (skinId === 0 || PetSkinController.instance.haveSkin(skinId)) {
                if (cloth.original.get(petInfo.id) !== skinId) {
                    await SAEngine.Socket.sendByQueue(47310, [catchTime, skinId]);
                } else {
                    cloth.use(({ original }) => {
                        original.delete(petInfo.id);
                    });
                }
                cloth.use(({ changed }) => {
                    changed.delete(petInfo.id);
                });
            } else {
                cloth.use(({ original, changed }) => {
                    if (!original.has(petInfo.id)) {
                        original.set(petInfo.id, petInfo.skinId);
                    }
                    changed.set(petInfo.id, {
                        skinId: skinId,
                        petSkinId: PetSkinXMLInfo.getSkinPetId(skinId, petInfo.id),
                    });
                });
            }
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, catchTime, skinId));
            callback();
        };

        SAEventHandler.SeerModuleStatePublisher.attach(this.subscriber, 'petBag');
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
