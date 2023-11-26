export const Hook = {
    Module: {
        loadScript: 'module_loadScript',
        show: 'module_show',
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
