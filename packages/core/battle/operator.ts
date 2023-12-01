import { CoreDevInfo, CoreWarning, ModuleName } from '../common/log.js';
import { delay } from '../common/utils.js';
import { Socket } from '../engine/index.js';

const warn = CoreWarning(ModuleName.Battle);
const info = CoreDevInfo(ModuleName.Battle);

export const Operator = {
    auto: () => {
        TimerManager.countDownOverHandler();
        // if (!FighterModelFactory.playerMode) {
        //     return;
        // }
        // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
        // skillPanel.auto();
    },
    useSkill: async (skillId?: number) => {
        if (!FighterModelFactory.playerMode || !skillId) {
            return false;
        }

        info(`[Operator] useSkill: ${SkillXMLInfo.getName(skillId)} ${skillId}`);

        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        controlPanelObserver.showFight();
        await delay(300);
        if (skillId <= 0) {
            warn('非法的skillId');
            return false;
        } else {
            await Socket.sendByQueue(CommandID.USE_SKILL, [skillId]);
        }
        return true;
    },
    escape: async () => {
        info(`[Operator] escape`);

        await Socket.sendByQueue(CommandID.ESCAPE_FIGHT);
        return true;
    },

    useItem: async (itemId: number) => {
        if (!FighterModelFactory.playerMode) {
            return false;
        }

        info(`[Operator] useItem: ${itemId}`);

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
            warn('非法的petIndex');
            return false;
        }

        info(`[Operator] switchPet: ${index}`);

        const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
        if (controlPanelObserver.petPanel == undefined) {
            controlPanelObserver.showPet();
            await delay(300);
        }

        const petBtn = controlPanelObserver.petPanel._petsArray[index];
        try {
            petBtn.autoUse();
            return true;
        } catch (error) {
            error instanceof Error && warn(`切换精灵失败: ${index} ${petBtn.info.name} ${error.message}`);
            return false;
        }
    },
};
