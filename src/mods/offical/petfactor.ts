import * as saco from '../../assisant/core';
import data from '../common.config.js';

let { SAModuleListener } = saco;

class PetFactorInfo {
    constructor() {
        SAModuleListener.subscribe('pvePetYinzi', () => {
            console.log('[PetFactorInfo]: 开始注入');
        });
    }
}

export default {
    mod: PetFactorInfo,
};
