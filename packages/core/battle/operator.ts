import { ModuleName, getModuleLogger } from '../common/log.js';
import { delay } from '../common/utils.js';
import { Socket } from '../engine/index.js';

const logger = getModuleLogger(ModuleName.Battle);

function auto() {
    TimerManager.countDownOverHandler();
    // if (!FighterModelFactory.playerMode) {
    //     return;
    // }
    // const {skillPanel} = FighterModelFactory.playerMode.subject.array[1];
    // skillPanel.auto();
}

async function useSkill(skillId?: number) {
    if (!FighterModelFactory.playerMode || !skillId) {
        return false;
    }

    logger.debug(`[operator] useSkill: ${SkillXMLInfo.getName(skillId)} ${skillId}`);

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    controlPanelObserver.showFight();
    await delay(300);
    if (skillId <= 0) {
        logger.warn('非法的skillId');
        return false;
    } else {
        await Socket.sendByQueue(CommandID.USE_SKILL, [skillId]);
    }
    return true;
}

async function escape() {
    logger.debug(`[operator] escape`);

    await Socket.sendByQueue(CommandID.ESCAPE_FIGHT);
    return true;
}

async function useItem(itemId: number) {
    if (!FighterModelFactory.playerMode) {
        return false;
    }

    logger.debug(`[operator] useItem: ${itemId}`);

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];

    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.itemPanel && currPanelType !== panel_type.skillPanel) {
        return false;
    }

    controlPanelObserver.showItem(1);
    await delay(300);
    controlPanelObserver.itemPanel.onUseItem(itemId);
    await delay(300);

    return true;
}

async function switchPet(index: number) {
    if (!FighterModelFactory.playerMode) {
        return false;
    }
    if (index == undefined || index < 0) {
        logger.warn('非法的petIndex');
        return false;
    }

    logger.debug(`[operator] switchPet: ${index}`);

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.petPanel) {
        controlPanelObserver.showPet();
        await delay(300);
    }

    const petBtn = controlPanelObserver.petPanel._petsArray[index];
    try {
        petBtn.autoUse();
        return true;
    } catch (error) {
        error instanceof Error && logger.warn(`切换精灵失败: ${index} ${error.message}`);
        return false;
    }
}

export const operator = {
    auto,
    useSkill,
    escape,
    useItem,
    switchPet,
};
