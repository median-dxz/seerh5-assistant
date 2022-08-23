import Pet, { PetFactory } from '../entities/pet.js';
import Skill, { SkillFactory } from '../entities/skill.js';
import RoundPetInfo from '../entities/roundinfo.js';

/**
 * @typedef RoundInfo
 * @type {object}
 * @property {RoundPetInfo | undefined} self
 * @property {RoundPetInfo | undefined} other
 * @property {number}  round
 * @property {boolean} isDiedSwitch
 */

export const BattleInfoProvider = {
    /**@type {[RoundPetInfo,RoundPetInfo] | null} */
    cachedRoundInfo: null,

    /**@returns {RoundInfo} */
    getCurRoundInfo() {
        /**@type {RoundInfo} */
        let result = {
            round: PetFightController.roundTimes,
            isDiedSwitch: PetFightController.roundTimes
                ? FighterModelFactory.playerMode.propView.dispatchNoBlood
                : false,
            self: undefined,
            other: undefined,
        };
        if (this.cachedRoundInfo) {
            this.cachedRoundInfo[0].isFirstMove = !(this.cachedRoundInfo[1].isFirstMove = false);
            if (this.cachedRoundInfo[0].userId != FightUserInfo.fighterInfos.myInfo.id) {
                [this.cachedRoundInfo[1], this.cachedRoundInfo[0]] = this.cachedRoundInfo;
            }
            result = { ...result, self: this.cachedRoundInfo[0], other: this.cachedRoundInfo[1] };
        }
        return result;
    },
    /**
     * @returns {Skill[] | false}
     */
    getCurSkills() {
        if (!FighterModelFactory.playerMode) return false;

        const infos = FighterModelFactory.playerMode.skillBtnViews;
        return infos.map((v) => {
            return {
                ...SkillFactory.formatById(v.skillID),
                pp: v.pp,
            };
        });
    },

    /**
     * @returns {Pet[] | false}
     */
    getPets() {
        if (!FightUserInfo.fighterInfos) return false;
        const infos = FightUserInfo.fighterInfos.myInfo._petCatchArr;
        return infos.map((v, i) => {
            return { index: i, ...PetFactory.formatByCatchtime(v) };
        });
    },
};
