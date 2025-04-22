import { getLogger } from '../common/logger.js';
import { delay, IS_DEV } from '../common/utils.js';
import * as socket from '../internal/socket.js';

const logger = getLogger('battle executor');

async function auto() {
    logger.debug(`auto`);
    TimerManager.countDownOverHandler();
    return Promise.resolve(true);
}

async function useSkill(skillId?: number) {
    if (!FighterModelFactory.playerMode || !skillId) {
        return false;
    }

    if (skillId < 0) {
        IS_DEV && console.warn(`非法的skillId: ${skillId}`);
        return false;
    }

    const controlPanelObserver = FighterModelFactory.playerMode.subject.array[1];
    const { currPanelType } = controlPanelObserver;
    if (currPanelType !== panel_type.skillPanel) {
        controlPanelObserver.showFight();
        await delay(300);
    }

    logger.debug(`useSkill: ${skillId} ${SkillXMLInfo.getName(skillId)}`);
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
        IS_DEV && console.warn(`非法的itemId: ${itemId}`);
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
        error instanceof Error && console.error(`使用物品失败: itemId: ${itemId}`, error);
        return false;
    }
}

async function switchPet(index?: number) {
    if (!FighterModelFactory.playerMode || !index) {
        return false;
    }
    if (index < 0) {
        IS_DEV && console.warn(`非法的petIndex ${index}`);
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
        error instanceof Error && console.error(`切换精灵失败: index: ${index}`, error);
        return false;
    }
}

export const executor = {
    auto,
    useSkill,
    escape,
    useItem,
    switchPet
};
