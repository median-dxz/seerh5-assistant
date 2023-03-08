import { delay } from '../common';
import { defaultStyle, SaModuleLogger } from '../logger';
import { SocketSendByQueue } from '../utils/socket';
const log = SaModuleLogger('BattleOperator', defaultStyle.core);

export const BattleOperator = {
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
            SocketSendByQueue(CommandID.USE_SKILL, skillId);
        }
    },
    escape: () => {
        SocketSendByQueue(CommandID.ESCAPE_FIGHT);
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
