import { Pet, PetRoundInfo, Skill } from '../entity';
import { getPetCached } from '../pet-helper';
export interface RoundInfo {
    self?: PetRoundInfo;
    other?: PetRoundInfo;
    round: number;
    isDiedSwitch: boolean;
}

export const Provider = {
    cachedRoundInfo: null as null | [PetRoundInfo, PetRoundInfo],
    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode || !FighterModelFactory.enemyMode) return null;
        let result: RoundInfo = {
            round: PetFightController.roundTimes,
            isDiedSwitch: PetFightController.roundTimes
                ? FighterModelFactory.playerMode.propView.dispatchNoBlood
                : false,
        };
        if (this.cachedRoundInfo) {
            this.cachedRoundInfo[0].isFirstMove = !(this.cachedRoundInfo[1].isFirstMove = false);
            if (this.cachedRoundInfo[0].userId !== FightUserInfo.fighterInfos!.myInfo.id) {
                this.cachedRoundInfo = [this.cachedRoundInfo[1], this.cachedRoundInfo[0]];
            }
            Object.assign(this.cachedRoundInfo[0], {
                id: FighterModelFactory.playerMode.info.petID,
                name: FighterModelFactory.playerMode.info.petName,
                // hp: FighterModelFactory.playerMode.info.hp,
            });
            Object.assign(this.cachedRoundInfo[1], {
                id: FighterModelFactory.enemyMode.info.petID,
                name: FighterModelFactory.enemyMode.info.petName,
                // hp: FighterModelFactory.enemyMode.info.hp,
            });
            result = { ...result, self: this.cachedRoundInfo[0], other: this.cachedRoundInfo[1] };
        }

        return result;
    },

    getCurSkills(): null | Skill[] {
        if (!FighterModelFactory.playerMode) return null;

        const infos = FighterModelFactory.playerMode.skillBtnViews;
        return infos.map((v) => {
            return Object.assign(Skill.formatById(v.skillID), { pp: v.pp });
        });
    },

    getPets(): null | Pet[] {
        if (!FightUserInfo.fighterInfos) return null;
        const infos = FightUserInfo.fighterInfos.myInfo.petCatchArr;
        return infos.map((v) => ({ ...getPetCached(v) }));
    },
};
