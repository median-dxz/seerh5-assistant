const events = {
    Socket: {},
    Module: {
        show: 'sa_module_show',
        loaded: 'sa_module_loaded',
    },
    BattlePanel: {
        start: 'sa_battle_start',
        roundEnd: 'sa_battle_roundEnd',
        onRoundData: 'sa_battle_roundData',
        completed: 'sa_battle_completed',
    },
    Award: {
        show: 'sa_award_show',
        receive: 'sa_award_receive',
    },
};
export { events as SA_CONST_EVENTS };
