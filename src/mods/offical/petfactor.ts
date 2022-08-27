import * as saco from '../../assisant/core';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('精灵因子', defaultStyle.mod);

let { ModuleListener } = saco;

class PetFactorInfo {
    constructor() {
        ModuleListener.subscribe('pvePetYinzi', () => {
            log('开始注入');
        });
    }
}

export default {
    mod: PetFactorInfo,
};
