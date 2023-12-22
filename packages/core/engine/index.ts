export * from './GameConfig.js';
export * as Socket from './socket.js';

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
import { isPetEffectActivated } from './query/isPetEffectActivated.js';
import { itemNum } from './query/itemNum.js';
import { playerAbilitySuits } from './query/playerAbilitySuits.js';
import { playerAbilityTitles } from './query/playerAbilityTitles.js';
import { playerSuit } from './query/playerSuit.js';
import { playerTitle } from './query/playerTitle.js';

import { findObject } from './ui/findObject.js';
import { imageButtonListener } from './ui/imageButtonListener.js';
import { inferCurrentModule } from './ui/inferCurrentModule.js';

const engine = {
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
    isPetEffectActivated,
    itemNum,
    playerAbilitySuits,
    playerAbilityTitles,
    playerSuit,
    playerTitle,
    findObject,
    imageButtonListener,
    inferCurrentModule,

    extend(func: AnyFunction | Record<string, AnyFunction>) {
        if (typeof func === 'function') {
            (engine as unknown as { [method: string]: AnyFunction })[func.name] = func;
        } else {
            Object.assign(engine, func);
        }
    },
};
