export { SAEventManager, SAModuleListener } from './eventhandler.js';

import Const from './const/_exports.js';
import * as Utils from './utils/sa-utils.js';
import * as Functions from './functions.js';
import * as PetHelper from './utils/pet-helper.js';
import * as BattleModule from './battle/battlemodule.js';
import * as PetFactor from './petfactor/core.js';

window.SA = {
    Const,
    Utils,
    PetHelper,
    Functions,
    BattleModule,
    PetFactor,
};

export { Const, Utils, Functions, PetHelper, BattleModule, PetFactor };
