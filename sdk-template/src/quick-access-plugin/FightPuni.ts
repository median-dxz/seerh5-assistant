import { Operator } from 'sa-core/battle';

export default {
    run() {
        FightManager.fightNoMapBoss(2237);
    },
    lower() {
        return Operator.auto();
    },
};
