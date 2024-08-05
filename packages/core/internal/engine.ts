import { getLogger } from '../common/logger.js';
import { IS_DEV, type AnyFunction } from '../common/utils.js';

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

const warnOverride = (func: string) => {
    IS_DEV && console.warn(`engine 已经存在 ${func} 方法, 该方法将被覆盖, 请检查潜在的冲突问题`);
    logger.warn(`extend: ${func} 方法将被覆盖`);
};

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
                warnOverride(func.name);
            }
            engine[func.name] = func;
            logger.info(`extend: ${func.name}`);
        } else {
            for (const [key, fn] of Object.entries(func)) {
                if (Object.hasOwn(engine, key)) {
                    warnOverride(key);
                }
                engine[key] = fn;
                logger.info(`extend: ${key}`);
            }
        }
    }
};

export interface SEAEngine {
    [func: string]: AnyFunction;
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
