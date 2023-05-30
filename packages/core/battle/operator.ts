import { SaModuleLogger, defaultStyle, delay } from '../common';
import { Socket } from '../engine';
const log = SaModuleLogger('BattleOperator', defaultStyle.core);

export const Operator = {
    auto: () => {
        TimerManager.countDownOverHandler();
    },
    useSkill: async (skillId?: number) => {
        if (!FighterModelFactory.playerMode || !skillId) {
            return false;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        controlPanelObserver.showFight();
        await delay(300);
        if (skillId <= 0) {
            // log('非法的skillId');
            return false;
        } else {
            log(`${FighterModelFactory.playerMode.info.petName} 使用技能: ${SkillXMLInfo.getName(skillId)}`);
            await Socket.sendByQueue(CommandID.USE_SKILL, skillId);
        }
        return true;
    },
    escape: async () => {
        await Socket.sendByQueue(CommandID.ESCAPE_FIGHT);
        return true;
    },

    useItem: async (itemId: number) => {
        if (!FighterModelFactory.playerMode) {
            return false;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        controlPanelObserver.showItem(1);
        await delay(300);
        controlPanelObserver.itemPanel.onUseItem(itemId);
        await delay(300);
        controlPanelObserver.showFight();
        return true;
    },

    switchPet: async (index: number) => {
        if (!FighterModelFactory.playerMode) {
            return false;
        }
        if (index == undefined || index < 0) {
            // log('非法的petIndex');
            return false;
        }
        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        if (controlPanelObserver.petPanel == undefined) {
            controlPanelObserver.showPet();
            await delay(300);
        }

        const petBtn = controlPanelObserver.petPanel._petsArray[index];
        try {
            petBtn.autoUse();
            log(`切换精灵: ${index} ${petBtn.info.name}`);
            return true;
        } catch (error) {
            log(`切换精灵失败: ${index} ${petBtn.info.name} ${error}`);
            return false;
        }
    },
};
