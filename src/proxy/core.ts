import * as Const from './const/_exports.js';
import * as Utils from './utils/sa-utils.js';
import * as Functions from './functions.ts';
import * as PetHelper from './utils/pet-helper.js';
import * as BattleModule from './battle/battlemodule.js';
import * as PetFactor from './factor/core.js';

const SA = {
    Const,
    Utils,
    PetHelper,
    Functions,
    BattleModule,
    PetFactor,
};

window.SA = SA;

export { SAModuleListener } from './eventhandler.js';
export { Const, Utils, Functions, PetHelper, BattleModule, PetFactor };

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => {
        window.SA = SA;
        window.SAEventManager = new EventTarget();
    });
}
