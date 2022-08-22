import Pet, { PetFactory } from '../entities/pet.js';
import Skill, { SkillFactory } from '../entities/skill.js';
import RoundPetInfo from '../entities/roundinfo.js';

export const BattleInfoProvider = {
    /**@type {[RoundPetInfo,RoundPetInfo] | null} */
    cachedRoundInfo: null,

    /**
     * @typedef RoundInfo
     * @type {object}
     * @property {RoundPetInfo | undefined} first
     * @property {RoundPetInfo | undefined} second
     * @property {number}  round
     * @property {boolean} isDiedSwitch
     */

    /**@returns {RoundInfo} */
    getCurRoundInfo() {
        /**@type {RoundInfo} */
        let result = {
            round: PetFightController.roundTimes,
            isDiedSwitch: FighterModelFactory.playerMode.propView.dispatchNoBlood,
            first: undefined,
            second: undefined,
        };
        if (this.cachedRoundInfo) {
            result = { ...result, first: this.cachedRoundInfo[0], second: this.cachedRoundInfo[1] };
        }
        console.log(result);
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
        if (!FightUserInfo.fighterInfos ) return false;
        const infos = FightUserInfo.fighterInfos.myInfo._petCatchArr;
        return infos.map((v, i) => {
            return { index: i, ...PetFactory.formatByCatchtime(v) };
        });
    },
};
