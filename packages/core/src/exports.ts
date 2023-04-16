import { checkEnv } from './common';

import * as Battle from './battle';
import * as Engine from './engine';
import * as Entity from './entity';
import * as EventHandler from './event-handler';
import * as PetHelper from './pet-helper';

const getHandler = <T extends object>(): ProxyHandler<T> => ({
    get: function (target, prop, receiver) {
        if (checkEnv()) {
            return Reflect.get(target, prop, receiver);
        } else {
            // throw new Error("[SACore]: seerh5 app hasn't been loaded yet.");
            return undefined;
        }
    },
});

export const SAEntity = new Proxy(Entity, getHandler<typeof Entity>());
export namespace SAEntity {
    export type IItemObject = import('./entity').IItemObject;
    export type IPFLevelBoss = import('./entity').IPFLevelBoss;
    export type IPetFragmentLevelObject = import('./entity').IPetFragmentLevelObject;
    export type IPetObject = import('./entity').IPetObject;
    export type ISkillObject = import('./entity').ISkillObject;
    export type Pet = import('./entity').Pet;
    export type Item = import('./entity').Item;
    export type PetElement = import('./entity').PetElement;
    export type PetFragmentLevel = import('./entity').PetFragmentLevel;
    export type PetRoundInfo = import('./entity').PetRoundInfo;
    export type Skill = import('./entity').Skill;
}

export const SABattle = new Proxy(Battle, getHandler<typeof Battle>());
export namespace SABattle {
    export type MoveModule = import('./battle').MoveModule;
    export type RoundInfo = import('./battle').RoundInfo;
    export type Strategy = import('./battle').Strategy;
    export type Trigger = import('./battle').Trigger;
}

export const SAEngine = new Proxy(Engine, getHandler<typeof Engine>());

export const SAEventHandler = new Proxy(EventHandler, getHandler<typeof EventHandler>());
export type { ModuleSubscriber } from './event-handler';
export * from './functions';

export const SAPetHelper = new Proxy(PetHelper, getHandler<typeof PetHelper>());
