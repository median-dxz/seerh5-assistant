import type { withClass } from '../common/utils.js';
import type { Pet, PetRoundInfo } from '../entity/index.ts';
import type { ProxyPet } from '../pet-helper/PetDataManager.ts';

export interface HookDataMap {
    module_openMainPanel: { module: string; panel: string };
    module_show: { module: string; id?: number; moduleInstance: withClass<BaseModule> };
    module_destroy: string;
    module_loadScript: string;

    battle_battleStart: undefined;
    battle_roundEnd: undefined;
    battle_endPropShown: undefined;
    battle_battleEnd: undefined;

    popview_open: string;
    popview_close: string;

    award_show: undefined;
    award_receive: { items?: Array<{ id: number; count: number }> };

    socket_send: { cmd: number; data: seerh5.SocketRequestData };
    socket_receive: { cmd: number; buffer?: egret.ByteArray };

    petbag_update: [Pet[], Pet[]];
    petbag_deactivate: undefined;
}

export interface SocketResponseMap {
    [cmd: number]: unknown;
    2505: readonly [PetRoundInfo, PetRoundInfo]; // NOTE_USE_SKILL
    2301: ProxyPet; // GET_PET_INFO
    2304: PetTakeOutInfo; // PET_RELEASE
    43706: readonly [ProxyPet[], ProxyPet[]]; // GET_PET_INFO_BY_ONCE
}

export interface GameConfigMap {
    item: seerh5.ItemObj;
    suit: seerh5.SuitObj;
    title: seerh5.TitleObj;
    element: seerh5.ElementObj;
    skill: seerh5.MoveObj;
    pet: seerh5.PetObj;
    statusEffect: seerh5.StatusEffectObj;
}

export interface GameModuleMap {
    [module: string]: BaseModule;
}
