import { Pet, PetRoundInfo, Skill } from '../entity';
import { SocketDataAccess } from '../event-handler/SocketSubscriber';

export interface RoundInfo {
    self?: PetRoundInfo;
    other?: PetRoundInfo;
    round: number;
    isDiedSwitch: boolean;
}

declare var CommandID: {
    NOTE_USE_SKILL: 2505;
};

declare namespace CommandData {
    type NOTE_USE_SKILL = [PetRoundInfo, PetRoundInfo];
}

export const Provider = {
    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode || !FighterModelFactory.enemyMode) return null;
        let result: RoundInfo = {
            round: PetFightController.roundTimes,
            isDiedSwitch: PetFightController.roundTimes
                ? FighterModelFactory.playerMode.propView.dispatchNoBlood
                : false,
        };
        let cachedRoundInfo = SocketDataAccess.getCache<CommandData.NOTE_USE_SKILL>(CommandID.NOTE_USE_SKILL);
        if (cachedRoundInfo) {
            cachedRoundInfo[0].isFirstMove = !(cachedRoundInfo[1].isFirstMove = false);
            if (cachedRoundInfo[0].userId !== FightUserInfo.fighterInfos!.myInfo.id) {
                cachedRoundInfo = [cachedRoundInfo[1], cachedRoundInfo[0]];
            }
            Object.assign(cachedRoundInfo[0], {
                id: FighterModelFactory.playerMode.info.petID,
                name: FighterModelFactory.playerMode.info.petName,
                // hp: FighterModelFactory.playerMode.info.hp,
            });
            Object.assign(cachedRoundInfo[1], {
                id: FighterModelFactory.enemyMode.info.petID,
                name: FighterModelFactory.enemyMode.info.petName,
                // hp: FighterModelFactory.enemyMode.info.hp,
            });
            result = { ...result, self: cachedRoundInfo[0], other: cachedRoundInfo[1] };
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
        return infos.map((v) => new Pet(PetManager.getPetInfo(v)));
    },
};
