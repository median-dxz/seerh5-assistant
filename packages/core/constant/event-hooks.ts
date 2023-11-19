import type { Pet } from '../entity/index.js';

export const Hook = {
    Module: {
        loadScript: 'module_loadScript',
        construct: 'module_construct',
        openMainPanel: 'module_openMainPanel',
        destroy: 'module_destroy',
    },
    PopView: {
        open: 'popview_open',
        close: 'popview_close',
    },
    Battle: {
        battleStart: 'battle_battleStart',
        roundEnd: 'battle_roundEnd',
        endPropShown: 'battle_endPropShown',
        battleEnd: 'battle_battleEnd',
    },
    Award: {
        show: 'award_show',
        receive: 'award_receive',
    },
    Socket: {
        send: 'socket_send',
        receive: 'socket_receive',
    },
    PetBag: {
        update: 'petbag_update',
        deactivate: 'petbag_deactivate',
    },
} as const;

export type SEAHookDataMap = {
    module_openMainPanel: { module: string; panel: string };
    module_construct: { module: string; id?: number };
    module_destroy: string;
    module_loadScript: string;
    popview_open: string;
    popview_close: string;
    award_receive: { items?: Array<{ id: number; count: number }> };
    socket_send: { cmd: number; data: SEAType.SocketRequestData };
    socket_receive: { cmd: number; buffer: egret.ByteArray | undefined };
    petbag_update: [Pet[], Pet[]];
};
