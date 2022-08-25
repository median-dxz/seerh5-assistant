import { SocketSendByQueue } from '../utils/sa-socket';
const { delay } = window;
export const BattleOperator = {
    useSkill: async (skillId: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        FighterModelFactory.playerMode.subject.array[1].showFight();
        await delay(200);
        if (!skillId || skillId <= 0) {
            console.log('[BattleOperator]: 非法的skillId');
            // FighterModelFactory.playerMode.conPanelObserver.skillPanel.auto();
        } else {
            console.log(
                '[BattleOperator]: ' + FighterModelFactory.playerMode.info.petName,
                SkillXMLInfo.getName(skillId)
            );
            SocketSendByQueue(CommandID.USE_SKILL, [skillId]);
        }
    },
    escape: () => {
        SocketSendByQueue(CommandID.ESCAPE_FIGHT, []);
    },

    useItem: async (itemID: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        FighterModelFactory.playerMode.subject.array[1].showItem(1);
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].itemPanel.onUseItem(itemID);
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].showFight();
    },

    switchPet: async (index: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        if (!index || index < 0) {
            console.log('[BattleOperator]: 非法的petIndex');
            return;
        }
        FighterModelFactory.playerMode.subject.array[1].showPet();
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].petPanel._petsArray[index].autoUse();
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].showFight();
    },
};
