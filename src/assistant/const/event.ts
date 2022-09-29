const events = {
    Socket: {},
    Module: {
        show: 'sa_module_show',
        loaded: 'sa_module_loaded',
    },
    BattlePanel: {
        panelReady: 'sa_battle_start',
        roundEnd: 'sa_battle_roundEnd',
        onRoundData: 'sa_battle_roundData',
        completed: 'sa_battle_completed',
    },
    Award: {
        show: 'sa_award_show',
        receive: 'sa_award_receive',
    },
} as const;
export { events as SA_CONST_EVENTS };

