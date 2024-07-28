import { getLogger } from '../common/log.js';
import type { AnyFunction } from '../common/utils.js';

import { lowerHp } from './function/lowerHp.js';
import { switchBag } from './function/switchBag.js';

import { buyPetItem } from './mutate/buyPetItem.js';
import { changeSuit } from './mutate/changeSuit.js';
import { changeTitle } from './mutate/changeTitle.js';
import { cureAllPet } from './mutate/cureAllPet.js';
import { fightBoss } from './mutate/fightBoss.js';
import { toggleAutoCure } from './mutate/toggleAutoCure.js';

import { autoCureState } from './query/autoCureState.js';
import { eliteStorageLimit } from './query/eliteStorageLimit.js';
import { itemNum } from './query/itemNum.js';
import { playerAbilitySuits } from './query/playerAbilitySuits.js';
import { playerAbilityTitles } from './query/playerAbilityTitles.js';
import { playerSuit } from './query/playerSuit.js';
import { playerTitle } from './query/playerTitle.js';

import { findObject } from './ui/findObject.js';
import { imageButtonListener } from './ui/imageButtonListener.js';
import { inferCurrentModule } from './ui/inferCurrentModule.js';

const logger = getLogger('engine');

export const engine: SEAEngine = {
    lowerHp,
    switchBag,
    buyPetItem,
    changeSuit,
    changeTitle,
    cureAllPet,
    fightBoss,
    toggleAutoCure,
    autoCureState,
    eliteStorageLimit,
    itemNum,
    playerAbilitySuits,
    playerAbilityTitles,
    playerSuit,
    playerTitle,
    findObject,
    imageButtonListener,
    inferCurrentModule,

    extend(func) {
        if (typeof func === 'function') {
            if (Object.hasOwn(engine, func.name)) {
                logger.warn(`engine 已经存在 ${func.name} 方法, 该方法将被覆盖, 请检查潜在的冲突问题`);
            }
            (engine as unknown as Record<string, AnyFunction>)[func.name] = func;
        } else {
            for (const key of Object.keys(func)) {
                if (Object.hasOwn(engine, key)) {
                    logger.warn(`engine 已经存在 ${key} 方法, 该方法将被覆盖, 请检查潜在的冲突问题`);
                }
            }
            Object.assign(engine, func);
        }
    }
};

export interface SEAEngine {
    lowerHp: typeof lowerHp;
    switchBag: typeof switchBag;
    buyPetItem: typeof buyPetItem;
    changeSuit: typeof changeSuit;
    changeTitle: typeof changeTitle;
    cureAllPet: typeof cureAllPet;
    fightBoss: typeof fightBoss;
    toggleAutoCure: typeof toggleAutoCure;
    autoCureState: typeof autoCureState;
    eliteStorageLimit: typeof eliteStorageLimit;
    itemNum: typeof itemNum;
    playerAbilitySuits: typeof playerAbilitySuits;
    playerAbilityTitles: typeof playerAbilityTitles;
    playerSuit: typeof playerSuit;
    playerTitle: typeof playerTitle;
    findObject: typeof findObject;
    imageButtonListener: typeof imageButtonListener;
    inferCurrentModule: typeof inferCurrentModule;
    extend(func: AnyFunction | Record<string, AnyFunction>): void;
}
