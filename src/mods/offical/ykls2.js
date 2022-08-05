import * as saco from '../../proxy/core.js';

const { BattleModule, Utils } = saco;

const { BaseSkillModule, BattleInfoProvider, BattleModuleManager, BattleOperator } = BattleModule;

class y2 {
    constructor() {}
    t = 0; //todo getvaule
    runOnce() {
        const battleModule = new BaseSkillModule.NameMatched(['骁勇战魂', '斗气护体', '碎梦袭']);
        BattleModule.BattleModuleManager.queuedModule(
            () => {
                Utils.SocketSendByQueue(CommandID.FIGHT_TRY_USE_PET, [724 + this.t, 0, 0, 0, 0, 0]); //0,1,2
            },
            (info, skills, pets) => {
                BattleOperator.useSkill(battleModule.match(skills));
            },
            () => {
                this.t++;
            }
        );
    }
}

export default {
    mod: y2,
};
