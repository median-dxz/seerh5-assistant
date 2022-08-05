import { delay } from "../utils/common.js";

export const BattleOperator = {
    useSkill: async (skillId) => {
        FighterModelFactory.playerMode.subject.array[1].showFight();
        await delay(200);
        if (!skillId) {
            FighterModelFactory.playerMode.skillBtnViews[0].autoUse();
        } else {
            console.log(
                "[BattleOperator]: " + FighterModelFactory.playerMode.info.petName,
                SkillXMLInfo.getName(skillId)
            );
            SocketConnection.send(CommandID.USE_SKILL, skillId);
        }
    },
    escape: () => {
        SocketConnection.send(CommandID.ESCAPE_FIGHT);
    },

    useItem: async (itemID) => {
        FighterModelFactory.playerMode.subject.array[1].showItem(1);
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].itemPanel.onUseItem(itemID);
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].showFight();
    },

    switchPet: async (index) => {
        FighterModelFactory.playerMode.subject.array[1].showPet();
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].petPanel._petsArray[index].autoUse();
        await delay(200);
        FighterModelFactory.playerMode.subject.array[1].showFight();
    },
};
