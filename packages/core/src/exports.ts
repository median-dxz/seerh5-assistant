import { checkEnv } from './common';

import * as Battle from './battle';
import * as Engine from './engine';
import * as Entity from './entity';
import * as EventHandler from './event-bus';

const getHandler = <T extends object>(): ProxyHandler<T> => ({
    get: function (target, prop, receiver) {
        if (checkEnv()) {
            return Reflect.get(target, prop, receiver);
        } else {
            throw new Error("[SACore]: seerh5 app hasn't been loaded yet.");
            // return undefined;
        }
    },
});

export const SAEntity = new Proxy(Entity, getHandler<typeof Entity>());

export namespace SAEntity {
    export type IItemObject = Entity.IItemObject;
    export type IPFLevelBoss = Entity.IPFLevelBoss;
    export type IPetFragmentLevelObject = Entity.IPetFragmentLevelObject;
    export type IPetObject = Entity.IPetObject;
    export type ISkillObject = Entity.ISkillObject;

    export type Pet = Entity.Pet;
    export type Item = Entity.Item;
    export type PetElement = Entity.PetElement;
    export type PetFragmentLevel = Entity.PetFragmentLevel;
    export type PetRoundInfo = Entity.PetRoundInfo;
    export type Skill = Entity.Skill;
}

export const SABattle = new Proxy(Battle, getHandler<typeof Battle>());

export namespace SABattle {
    export type MoveModule = Battle.MoveModule;
    export type RoundInfo = Battle.RoundInfo;
    export type Strategy = Battle.Strategy;
    export type Trigger = Battle.Trigger;
}

export const SAEngine = new Proxy(Engine, getHandler<typeof Engine>());

export const SAEvent = new Proxy(EventHandler, getHandler<typeof EventHandler>());

export type { GameModuleEventHandler, SASocketData, SocketEventHandler } from './event-bus';

export * from './functions';
export * from './pet-helper';