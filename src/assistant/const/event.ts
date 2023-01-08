const events = {
    Socket: {},
    Module: {
        loadScript: 'sa_module_script_loaded',
        construct: 'sa_module_construct',
        destroy: 'sa_module_destroy',
    },
    BattlePanel: {
        panelReady: 'sa_battle_start',
        roundEnd: 'sa_battle_roundEnd',
        onRoundData: 'sa_battle_roundData',
        endPropShown: 'sa_battle_resultPanel_show',
        battleEnd: 'sa_battle_end',
    },
    Award: {
        show: 'sa_award_show',
        receive: 'sa_award_receive',
    },
} as const;
export { events as SA_CONST_EVENTS };

