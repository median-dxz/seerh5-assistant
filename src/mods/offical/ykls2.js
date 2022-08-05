import * as saco from '../../proxy/core.js';

const { BattleModule } = saco;

class y2 {
    constructor() {}
    t = 0; //todo getvaule
    runOnce() {
        BattleModule.BattleModuleManager.queuedModule(
            () => {
                SocketConnection.sendByQueue(CommandID.FIGHT_TRY_USE_PET, [724 + this.t, 0, 0, 0, 0, 0]); //0,1,2
            },
            (info, skills, pets) => {
                let flag = false;
                for (let s of skills) {
                    if (s.category == 4 && s.pp > 0) {
                        BattleModule.BattleOperator.useSkill();
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    for (let s of skills) {
                        if (s.category != 4 && s.pp > 0) {
                            BattleModule.BattleOperator.useSkill();
                            break;
                        }
                    }
                }
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
