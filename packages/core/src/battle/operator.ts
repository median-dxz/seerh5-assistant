import { delay } from '../common';
import { Socket } from '../engine';
import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('BattleOperator', defaultStyle.core);

export const Operator = {
    auto: () => {
        TimerManager.countDownOverHandler();
    },
    useSkill: async (skillId: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        controlPanelObserver.showFight();
        await delay(300);
        if (!skillId || skillId <= 0) {
            log('非法的skillId');
        } else {
            log(FighterModelFactory.playerMode.info.petName, SkillXMLInfo.getName(skillId));
            Socket.sendByQueue(CommandID.USE_SKILL, skillId);
        }
    },
    escape: () => {
        Socket.sendByQueue(CommandID.ESCAPE_FIGHT);
    },

    useItem: async (itemId: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        controlPanelObserver.showItem(1);
        await delay(300);
        controlPanelObserver.itemPanel.onUseItem(itemId);
        await delay(300);
        controlPanelObserver.showFight();
    },

    switchPet: async (index: number) => {
        if (!FighterModelFactory.playerMode) {
            return;
        }
        if (!index || index < 0) {
            log('非法的petIndex');
            return;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        if (controlPanelObserver.petPanel == undefined) {
            controlPanelObserver.showPet();
            await delay(300);
        }
        controlPanelObserver.petPanel._petsArray[index].autoUse();
        await delay(300);
    },
};
