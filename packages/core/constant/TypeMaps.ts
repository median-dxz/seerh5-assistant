import type { WithClass } from '../common/utils.js';
import type { Pet, PetRoundInfo } from '../entity/index.js';
import type { CaughtPet } from '../pet-helper/SEAPet.js';

export interface HookPointDataMap {
    'module:openMainPanel': { module: string; panel: string };
    'module:show': { module: string; id?: number; moduleInstance: WithClass<BaseModule> };
    'module:loadScript': string;
    'module:destroy': string;

    'battle:start': undefined;
    'battle:roundEnd': undefined;
    'battle:showEndProp': undefined;
    'battle:end': undefined;

    'pop_view:open': string;
    'pop_view:close': string;

    'award:show': undefined;
    'award:receive': { items?: Array<{ id: number; count: number }> };

    'socket:send': { cmd: number; data: seerh5.SocketRequestData };
    'socket:receive': { cmd: number; buffer?: egret.ByteArray };

    'pet_bag:update': [Pet[], Pet[]];
    'pet_bag:deactivate': undefined;
}

export interface SocketResponseMap {
    [cmd: number]: unknown;
    2505: readonly [PetRoundInfo, PetRoundInfo]; // NOTE_USE_SKILL
    2301: CaughtPet; // GET_PET_INFO
    2304: PetTakeOutInfo; // PET_RELEASE
    43706: readonly [CaughtPet[], CaughtPet[]]; // GET_PET_INFO_BY_ONCE
}

export interface GameConfigMap {
    item: seerh5.ItemObj;
    suit: seerh5.SuitObj;
    title: seerh5.TitleObj;
    element: seerh5.ElementObj;
    skill: seerh5.MoveObj;
    pet: seerh5.PetObj;
    statusEffect: seerh5.StatusEffectObj;
    equipment: seerh5.EquipmentObj;
}

export interface GameModuleMap {
    [module: string]: BaseModule;
}
