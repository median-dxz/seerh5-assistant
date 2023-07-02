import { NOOP, Socket, createLocalStorageProxy } from 'sa-core';

const StorageKey = 'LocalSkin';

interface SkinInfo {
    skinId: number;
    petSkinId: number;
}

const cloth = createLocalStorageProxy<{ changed: Map<number, SkinInfo>; original: Map<number, number> }>(
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

class LocalPetSkin implements SAMod.IBaseMod {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'LocalPetSkin',
        scope: 'median',
        type: 'base',
        description: '本地全皮肤解锁',
    };

    activate() {
        Object.defineProperty(FighterUserInfo.prototype, 'petInfoArr', {
            set: function (t) {
                const skinId = (r: PetInfo) => (this.id == MainManager.actorID ? r.skinId : r._skinId ?? 0);
                this._petInfoArr = t;
                this._petIDArr = [];
                this._petCatchArr = [];
                this._petSkillIDArr = [];
                this._aliveNum = 0;
                for (const r of this._petInfoArr) {
                    const o = PetFightSkinSkillReplaceXMLInfo.getSkills(skinId(r), r.id);
                    let id = r.id;
                    id = PetIdTransform.getPetId(id, r.catchTime, !0);
                    0 != skinId(r) && (id = PetSkinXMLInfo.getSkinPetId(skinId(r), r.id));
                    this._petIDArr.push(id);
                    this._petCatchArr.push(r.catchTime);
                    for (const _ of r.skillArray) {
                        if (_ instanceof PetSkillInfo) {
                            this.add2List(this._petSkillIDArr, _.id, o);
                        } else {
                            this.add2List(this._petSkillIDArr, _, o);
                        }
                    }
                    r.hideSKill && this.add2List(this._petSkillIDArr, r.hideSKill.id, o);
                    r.hp > 0 && this._aliveNum++;
                }
            },
        });

        Object.defineProperty(FightPetInfo.prototype, 'skinId', {
            get: function () {
                return cloth.changed.has(this._petID) && this.userID == MainManager.actorID
                    ? cloth.changed.get(this._petID)!.skinId
                    : this._skinId ?? 0;
            },
        });

        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function (this: PetInfo) {
                return cloth.changed.has(this.id) ? cloth.changed.get(this.id)!.skinId : this._skinId ?? 0;
            },
        });

        PetManager.equipSkin = async (catchTime, skinId = 0, callback = NOOP) => {
            const petInfo = PetManager.getPetInfo(catchTime);
            this.logger('new skin id:', skinId, 'previous skin id:', petInfo.skinId);
            if (skinId === 0 || PetSkinController.instance.haveSkin(skinId)) {
                if (cloth.original.get(petInfo.id) !== skinId) {
                    await Socket.sendByQueue(47310, [catchTime, skinId]);
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
    }
}

export default LocalPetSkin;
