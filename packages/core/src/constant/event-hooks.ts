import type { Pet } from '../entity/Pet';

export const Hook = {
    Module: {
        loadScript: 'sa_module_script_loaded',
        construct: 'sa_module_construct',
        openMainPanel: 'sa_module_open_main_panel',
        destroy: 'sa_module_destroy',
    },
    BattlePanel: {
        panelReady: 'sa_battle_start',
        roundEnd: 'sa_battle_roundEnd',
        endPropShown: 'sa_battle_resultPanel_show',
        battleEnd: 'sa_battle_end',
    },
    Award: {
        show: 'sa_award_show',
        receive: 'sa_award_receive',
    },
    Socket: {
        send: 'sa_socket_send',
        receive: 'sa_socket_receive',
    },
    PetBag: {
        update: 'sa_pet_bag_update',
        deactivate: 'sa_pet_bag_deactivate',
    },
} as const;

export type SAHookData = {
    sa_module_open_main_panel: { module: string; panel: string };
    sa_module_construct: string;
    sa_module_destroy: string;
    sa_award_receive: { items: any };
    sa_socket_send: { cmd: number; data: SAType.SocketRequestData };
    sa_socket_receive: { cmd: number; buffer: egret.ByteArray | undefined };
    sa_pet_bag_update: [Pet[], Pet[]];
    sa_module_script_loaded: string;
};
