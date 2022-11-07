import * as saco from '../../assistant/core';
import { ReflectObjBase } from '../../assistant/mod-loader';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('精灵因子', defaultStyle.mod);

let { ModuleListener } = saco;

class PetFactorInfo extends ReflectObjBase implements ModClass {
    constructor() {
        super();
        ModuleListener.subscribe('pvePetYinzi', () => {
            log('开始注入');
        });
    }
    init() {}
    meta = { description: '精灵因子' };
}

export default {
    mod: PetFactorInfo,
};
