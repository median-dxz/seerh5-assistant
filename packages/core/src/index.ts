export * from './common';
export * as Constant from './constant';
export * from './loader';
export * from './logger';

declare global {
    /** `sac`全局变量使用的额外命名空间 */
    export namespace sac {
        /** 全局事件处理对象 */
        var SAEventTarget: EventTarget;
        /** 原生客户端`console.log`的正则过滤列表 */
        var filterLogText: RegExp[];
        /** 原生客户端`console.warn`的正则过滤列表 */
        var filterWarnText: RegExp[];
        var Mods: Map<string, import('./mod-manager/loader').Mod>;
        var SeerH5Ready: boolean;
        var SacReady: boolean;
        var ResourceCache: Map<string, string>;
    }
}

import * as Exports from './exports';

export namespace SAEntity {
    export type IItemObject = import('./entity').IItemObject;
    export type IPFLevelBoss = import('./entity').IPFLevelBoss;
    export type IPetFragmentLevelObject = import('./entity').IPetFragmentLevelObject;
    export type IPetObject = import('./entity').IPetObject;
    export type ISkillObject = import('./entity').ISkillObject;
    export const Item = Exports.SAEntity.Item;
    export const Pet = Exports.SAEntity.Pet;
    export const PetElement = Exports.SAEntity.PetElement;
    export const PetFragmentLevel = Exports.SAEntity.PetFragmentLevel;
    export const PetRoundInfo = Exports.SAEntity.PetRoundInfo;
    export const Skill = Exports.SAEntity.Skill;
}

export namespace SABattle {
    export const Provider = Exports.SABattle.Provider;
    export const Manager = Exports.SAEntity.Manager;
    export const Operator = Exports.SAEntity.Operator;
}