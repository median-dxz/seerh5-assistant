import { getLogger } from '../common/log.js';
import { delay } from '../common/utils.js';
import { socket } from '../internal/index.js';

const logger = getLogger('battle');

function auto() {
    TimerManager.countDownOverHandler();
    return true;
}

async function useSkill(skillId?: number) {
    if (!FighterModelFactory.playerMode || !skillId) {
        return false;
    }
    if (skillId < 0) {
        logger.warn(`非法的skillId: ${skillId}`);
        return false;
    }

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.skillPanel) {
        controlPanelObserver.showFight();
        await delay(300);
    }

    logger.debug(`useSkill: ${SkillXMLInfo.getName(skillId)} ${skillId}`);
    await socket.sendByQueue(CommandID.USE_SKILL, [skillId]);

    return true;
}

async function escape() {
    logger.debug(`escape`);
    await socket.sendByQueue(CommandID.ESCAPE_FIGHT);
    return true;
}

async function useItem(itemId?: number) {
    if (!FighterModelFactory.playerMode || !itemId) {
        return false;
    }
    if (itemId < 0) {
        logger.warn(`非法的itemId: ${itemId}`);
        return false;
    }

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.itemPanel) {
        controlPanelObserver.showItem(1);
        await delay(300);
    }

    logger.debug(`useItem: ${itemId}`);
    try {
        controlPanelObserver.itemPanel.onUseItem(itemId);
        await delay(300);
        return true;
    } catch (error) {
        error instanceof Error && logger.warn(`使用物品失败: id: ${itemId} ${error.message}`);
        return false;
    }
}

async function switchPet(index?: number) {
    if (!FighterModelFactory.playerMode || !index) {
        return false;
    }
    if (index < 0) {
        logger.warn(`非法的petIndex ${index}`);
        return false;
    }

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.petPanel) {
        controlPanelObserver.showPet();
        await delay(300);
    }

    const petBtn = controlPanelObserver.petPanel._petsArray[index];
    logger.debug(`switchPet: ${index} ${petBtn.info.name}`);
    try {
        petBtn.autoUse();
        await delay(300);
        return true;
    } catch (error) {
        error instanceof Error && logger.warn(`切换精灵失败: index: ${index} ${error.message}`);
        return false;
    }
}

export const executor = {
    auto,
    useSkill,
    escape,
    useItem,
    switchPet,
};
