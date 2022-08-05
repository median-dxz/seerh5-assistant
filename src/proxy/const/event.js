const events = {
    Socket: {},
    Module: {
        open: "sa_module_open",
        loaded: "sa_module_loaded",
    },
    BattlePanel: {
        start: "sa_battle_start",
        roundEnd: "sa_battle_roundEnd",
        completed: "sa_battle_completed",
    },
    AwardDialog: {
        show: "sa_awardDialog_show",
    },
};
export { events as SA_CONST_EVENTS };
