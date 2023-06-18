/// <reference path="../env.d.ts" />

export default {
    测试模型: {
        beforeBattle() {
            sac.BattleFireType;
        },
        /** @type {import('sa-core').MoveStrategy} */
        moveModule: sac.generateStrategy([], []),
        pets: [],
    },
};
