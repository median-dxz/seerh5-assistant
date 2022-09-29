import Pet, { PetFactory } from '../entities/pet';
import RoundPetInfo from '../entities/roundinfo';
import Skill, { SkillFactory } from '../entities/skill';

export type PetSwitchInfos = (Pet & { index: number })[];
export interface RoundInfo {
    self?: RoundPetInfo;
    other?: RoundPetInfo;
    round: number;
    isDiedSwitch: boolean;
}

interface BattleInfoProvider {
    cachedRoundInfo: [RoundPetInfo, RoundPetInfo] | null;
    getCurRoundInfo(): RoundInfo | null;
    getCurSkills(): Skill[] | null;
    getPets(): PetSwitchInfos | null;
}
export const BattleInfoProvider: BattleInfoProvider = {
    cachedRoundInfo: null,
    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode) return null;
        let result: RoundInfo = {
            round: PetFightController.roundTimes,
            isDiedSwitch: PetFightController.roundTimes
                ? FighterModelFactory.playerMode.propView.dispatchNoBlood
                : false,
            self: undefined,
            other: undefined,
        };
        if (this.cachedRoundInfo) {
            this.cachedRoundInfo[0].isFirstMove = !(this.cachedRoundInfo[1].isFirstMove = false);
            if (this.cachedRoundInfo[0].userId !== FightUserInfo.fighterInfos!.myInfo.id) {
                this.cachedRoundInfo = [this.cachedRoundInfo[1], this.cachedRoundInfo[0]];
            }
            result = { ...result, self: this.cachedRoundInfo[0], other: this.cachedRoundInfo[1] };
        }
        return result;
    },

    getCurSkills() {
        if (!FighterModelFactory.playerMode) return null;

        const infos = FighterModelFactory.playerMode.skillBtnViews;
        return infos.map((v) => {
            return Object.assign(SkillFactory.formatById(v.skillID), { pp: v.pp });
        });
    },

    getPets() {
        if (!FightUserInfo.fighterInfos) return null;
        const infos = FightUserInfo.fighterInfos.myInfo._petCatchArr;
        return infos.map((v, i) => {
            return Object.assign(PetFactory.formatByCatchtime(v), { index: i });
        });
    },
};
