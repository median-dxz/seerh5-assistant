import { checkEnv } from './common';

import * as Entity from './entity';
import * as Battle from './battle';

// let EventHandler = new Proxy(SAEventHandler, getHandler<typeof SAEventHandler>());
// let Functions = new Proxy(SAFunctions, getHandler<typeof SAFunctions>());
// let PetHelper = new Proxy(SAPetHelper, getHandler<typeof SAPetHelper>());
// let Utils = new Proxy(SAUtils, getHandler<typeof SAUtils>());
// export { Battle, EventHandler, Functions, PetHelper, Utils };

// import * as SAEventHandler from './event-handler';
// import * as SAFunctions from './functions';
// import * as SAPetHelper from './pet-helper';
// import * as SAUtils from './utils';

const getHandler = <T extends object>(): ProxyHandler<T> => ({
    get: function (target, prop, receiver) {
        if (checkEnv()) {
            return Reflect.get(target, prop, receiver);
        } else {
            throw new Error("[SACore]: seerh5 app hasn't been loaded yet.");
        }
    },
});

export const SAEntity = new Proxy(Entity, getHandler<typeof Entity>());
export const SABattle = new Proxy(Battle, getHandler<typeof Battle>());
