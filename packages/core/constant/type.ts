import type { Pet, PetRoundInfo } from '../entity/index.js';
import type { ProxyPet } from '../pet-helper/PetDataManager.js';

export type HookDataMap = {
    module_openMainPanel: { module: string; panel: string };
    module_construct: { module: string; id?: number };
    module_destroy: string;
    module_loadScript: string;
    popview_open: string;
    popview_close: string;
    award_receive: { items?: Array<{ id: number; count: number }> };
    socket_send: { cmd: number; data: seerh5.SocketRequestData };
    socket_receive: { cmd: number; buffer: egret.ByteArray | undefined };
    petbag_update: [Pet[], Pet[]];
};

export type SocketResponseMap = {
    2505: readonly [PetRoundInfo, PetRoundInfo]; // NOTE_USE_SKILL
    2301: ProxyPet; // GET_PET_INFO
    2304: PetTakeOutInfo; // PET_RELEASE
    43706: readonly [ProxyPet[], ProxyPet[]]; // GET_PET_INFO_BY_ONCE
};

export type GameConfigMap = {
    item: seerh5.ItemObj;
    suit: seerh5.SuitObj;
    title: seerh5.TitleObj;
    element: seerh5.ElementObj;
    skill: seerh5.MoveObj;
    pet: seerh5.PetObj;
    statusEffect: seerh5.StatusEffectObj;
};

export type GameModuleMap = {};
