import Pet from "../entities/pet.js";
import Skill from "../entities/skill.js";
import { RoundInfo } from "./type.d.js";

export const BattleInfoProvider = {
    /**
     * @returns {RoundInfo}
     */
    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode) return {};

        return {
            pet: {
                ct: FighterModelFactory.playerMode.info.catchTime,
                hp: FighterModelFactory.playerMode.info.hp,
                maxHP: FighterModelFactory.playerMode.info.maxHP,
                name: FighterModelFactory.playerMode.info.petName,
            },
            round: PetFightController.roundTimes,
            isDiedSwitch: FighterModelFactory.playerMode.propView.dispatchNoBlood,
        };
    },
    /**
     * @returns {Skill[]}
     */
    getCurSkills() {
        if (!FighterModelFactory.playerMode) return {};

        let infos = FighterModelFactory.playerMode.skillBtnViews;
        return infos.map((v, i) => {
            return {
                ...new Skill(v.skillID),
                pp: v.pp,
            };
        });
    },
    /**
     * @returns {Pet[]}
     */
    getPets() {
        const infos = FightUserInfo.fighterInfos.myInfo._petCatchArr;
        return infos.map((v, i) => {
            return { index: i, ...new Pet(PetManager.getPetInfo(v)) };
        });
    },
};
