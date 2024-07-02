import { scope } from '@/common/constants.json';
import { NOOP, socket } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

interface SkinInfo {
    skinId: number;
    petSkinId: number;
}

declare var PetFightSkinSkillReplaceXMLInfo: any;
declare var PetIdTransform: any;
declare var PetSkinXMLInfo: any;
declare var PetSkinController: any;

export const metadata = {
    id: 'LocalPetSkin',
    scope,
    version: '1.0.0',
    description: '本地全皮肤解锁',
    data: { changed: new Map<number, SkinInfo>(), original: new Map<number, number>() }
} satisfies SEAModMetadata;

export default async function LocalPetSkin({ data, mutate, logger }: SEAModContext<typeof metadata>) {
    function install() {
        const cloth = data;

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
            }
        });

        Object.defineProperty(FightPetInfo.prototype, 'skinId', {
            get: function () {
                return cloth.changed.has(this._petID) && this.userID == MainManager.actorID
                    ? cloth.changed.get(this._petID)!.skinId
                    : this._skinId ?? 0;
            }
        });

        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function (this: PetInfo) {
                return cloth.changed.has(this.id) ? cloth.changed.get(this.id)!.skinId : this._skinId ?? 0;
            }
        });

        PetManager.equipSkin = async (catchTime, skinId = 0, callback = NOOP) => {
            const petInfo = PetManager.getPetInfo(catchTime);
            logger('new skin id:', skinId, 'previous skin id:', petInfo.skinId);

            if (skinId === 0 || PetSkinController.instance.haveSkin(skinId)) {
                if (cloth.original.get(petInfo.id) !== skinId) {
                    await socket.sendByQueue(47310, [catchTime, skinId]);
                } else {
                    mutate(({ changed, original }) => {
                        changed.delete(petInfo.id);
                        original.delete(petInfo.id);
                    });
                }
                mutate(({ changed }) => {
                    changed.delete(petInfo.id);
                });
            } else {
                if (!cloth.original.has(petInfo.id)) {
                    mutate(({ original }) => {
                        original.set(petInfo.id, petInfo.skinId);
                    });
                }
                mutate(({ changed }) => {
                    changed.set(petInfo.id, {
                        skinId: skinId,
                        petSkinId: PetSkinXMLInfo.getSkinPetId(skinId, petInfo.id)
                    });
                });
            }
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, catchTime, skinId));
            callback();
        };
    }

    return {
        install
    } satisfies SEAModExport;
}
