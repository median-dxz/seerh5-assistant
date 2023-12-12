import initBattle from '../../battle/internal.js';
import registerEngine from '../../engine/internal/index.js';
import initPet from '../../pet-helper/internal.js';
import registerHooks from './registerHooks.js';

import { enableBetterAlarm } from './enableBetterAlarm.js';
import { enableFastStaticAnimation } from './enableFastStaticAnimation.js';
import { fixSoundLoad } from './fixSoundLoad.js';
import { loadScript } from './loadScript.js';

export function coreSetupBasic() {
    ModuleManager.loadScript = loadScript;
    fixSoundLoad();
}

export function coreSetup() {
    registerHooks();
    registerEngine();
    initPet();
    initBattle();
    enableFastStaticAnimation();
    enableBetterAlarm();
}
