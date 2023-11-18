import type { Pet } from '../entity/index.js';

export const Hook = {
    Module: {
        loadScript: 'sea_module_script_loaded',
        construct: 'sea_module_construct',
        openMainPanel: 'sea_module_open_main_panel',
        destroy: 'sea_module_destroy',
    },
    Battle: {
        battleStart: 'sea_battle_start',
        roundEnd: 'sea_battle_roundEnd',
        endPropShown: 'sea_battle_resultPanel_show',
        battleEnd: 'sea_battle_end',
    },
    Award: {
        show: 'sea_award_show',
        receive: 'sea_award_receive',
    },
    Socket: {
        send: 'sea_socket_send',
        receive: 'sea_socket_receive',
    },
    PetBag: {
        update: 'sea_pet_bag_update',
        deactivate: 'sea_pet_bag_deactivate',
    },
} as const;

export type SEAHookData = {
    sea_module_open_main_panel: { module: string; panel: string };
    sea_module_construct: string;
    sea_module_destroy: string;
    sea_award_receive: { items?: Array<{ id: number; count: number }> };
    sea_socket_send: { cmd: number; data: SEAType.SocketRequestData };
    sea_socket_receive: { cmd: number; buffer: egret.ByteArray | undefined };
    sea_pet_bag_update: [Pet[], Pet[]];
    sea_module_script_loaded: string;
};
