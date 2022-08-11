import * as saco from '../../proxy/core.js';

const { BattleModule, Utils } = saco;

const { BaseSkillModule, BattleInfoProvider, BattleModuleManager, BattleOperator } = BattleModule;

class ykls2 {
    constructor() {}
    values = {
        惩戒能量: 0,
        狂热能量: 0,
        挑战情况: 0,
    };

    async updateInfo() {
        return Utils.GetMultiValue(104122, 104123, 104124, 104125, 104126, 16685).then((result) => {
            this.values = {
                惩戒能量: result[0],
                狂热能量: result[1],
                挑战情况: result[5],
            };
            return this.values;
        });
    }

    run() {
        const battleModule = new BaseSkillModule.NameMatched(['骁勇战魂', '斗气护体', '碎梦袭']);
        for (let t = 0; t < 3; t++) {
            if (!(this.values.挑战情况 & (1 << t))) {
                BattleModule.BattleModuleManager.queuedModule(
                    async () => {
                        Utils.SocketSendByQueue(CommandID.FIGHT_TRY_USE_PET, [724 + t, 0, 0, 0, 0, 0]); //0,1,2
                    },
                    async (info, skills, pets) => {
                        BattleOperator.useSkill(battleModule.match(skills));
                    },
                    async () => {
                        await this.updateInfo();
                    }
                );
            }
        }
    }
}

export default {
    mod: ykls2,
};
