import { CacheData, NOOP } from '../common/utils.js';
import type { PetRoundInfo } from '../entity/index.js';
import { Pet, Skill } from '../entity/index.js';

export interface RoundData {
    self: PetRoundInfo;
    other: PetRoundInfo;
    round: number;
    isSwitchNoBlood: boolean;
}

export const cachedRoundInfo = new CacheData<[PetRoundInfo, PetRoundInfo] | null>(null, NOOP);

export const Provider = {
    isInBattle() {
        return FightNoteCmdListener.isInFightModule;
    },

    getCurRoundInfo() {
        if (!FighterModelFactory.playerMode || !FighterModelFactory.enemyMode) return null;
        const result = {
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

        return { ...result, self: roundInfo[0], other: roundInfo[1] } as RoundData;
    },

    getCurSkills(): null | Skill[] {
        if (!FighterModelFactory.playerMode) return null;

        const infos = FighterModelFactory.playerMode.skillBtnViews;
        return infos.map((v) => Object.assign(Skill.formatById(v.skillID), { pp: v.pp }));
    },

    getPets(): null | Pet[] {
        if (!FightUserInfo.fighterInfos) return null;
        const infos = FightUserInfo.fighterInfos.myInfo.petCatchArr;
        return infos.map((v) => new Pet(PetManager.getPetInfo(v)));
    },
};
