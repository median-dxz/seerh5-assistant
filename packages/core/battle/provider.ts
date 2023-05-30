import { Pet, PetRoundInfo, Skill } from '../entity';
import { cachedRoundInfo } from './internal';

export interface RoundInfo {
    self?: PetRoundInfo;
    other?: PetRoundInfo;
    round: number;
    isSwitchNoBlood: boolean;
}

export const Provider = {
    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode || !FighterModelFactory.enemyMode) return null;
        let result: RoundInfo = {
            round: PetFightController.roundTimes,
            isSwitchNoBlood: PetFightController.roundTimes
                ? FighterModelFactory.playerMode.propView.dispatchNoBlood
                : false,
        };

        let roundInfo = cachedRoundInfo.getImmediate();

        if (!roundInfo || PetFightController.roundTimes === 0) {
            roundInfo = [{}, {}] as [PetRoundInfo, PetRoundInfo];
        } else {
            roundInfo[0].isFirstMove = !(roundInfo[1].isFirstMove = false);
            if (roundInfo[0].userId !== FightUserInfo.fighterInfos!.myInfo.id) {
                roundInfo = [roundInfo[1], roundInfo[0]];
            }
        }

        roundInfo[0] = Object.assign(roundInfo[0], {
            userId: FighterModelFactory.playerMode.info.userID,
            id: FighterModelFactory.playerMode.info.petID,
            name: FighterModelFactory.playerMode.info.petName,
            hp: {
                gain: roundInfo[0]?.hp?.gain ?? 0,
                remain: FighterModelFactory.playerMode.info.hp,
                max: FighterModelFactory.playerMode.info.maxHP,
            },
            catchtime: FighterModelFactory.playerMode.info.catchTime,
        });

        roundInfo[1] = Object.assign(roundInfo[1], {
            userId: FighterModelFactory.enemyMode.info.userID,
            id: FighterModelFactory.enemyMode.info.petID,
            name: FighterModelFactory.enemyMode.info.petName,
            hp: {
                gain: roundInfo[1]?.hp?.gain ?? 0,
                remain: FighterModelFactory.enemyMode.info.hp,
                max: FighterModelFactory.enemyMode.info.maxHP,
            },
            catchtime: FighterModelFactory.enemyMode.info.catchTime,
        });

        result = { ...result, self: roundInfo[0], other: roundInfo[1] };
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
