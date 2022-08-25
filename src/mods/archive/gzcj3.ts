import * as saco from '../../assisant/core';
import data from '../common.config.js';

const { BattleModule, Utils, PetHelper, Functions } = saco;
const { BaseSkillModule, BattleInfoProvider, BattleModuleManager, BattleOperator } = BattleModule;

const AttrConst = {
    daily_gzcjykls_times: 15950,
};

const NMS = new BaseSkillModule.NameMatched(['诸雄之主']);
const ct = data.petCts;

class gzcj3 {
    constructor() {}
    init() {
        Functions.SwitchBag([{ catchTime: ct.混沌魔君索伦森, name: '混沌魔君索伦森' }]);
        PetHelper.setDefault(ct.混沌魔君索伦森);
        this.update();
    }
    async update() {
        const [v] = await Utils.GetMultiValue(AttrConst.daily_gzcjykls_times);
        this.activityInfo.剩余次数 = 20 - v;
        console.log(`[光之惩戒第三关]: 今日剩余次数: ${20 - v}`);
    }
    activityInfo = { 剩余次数: 0 };
    run() {
        const entry = () => {
            FightManager.fightNoMapBoss('', 12117);
        };
        const finish = async () => {
            await this.update();
            if (this.activityInfo.剩余次数 > 0) {
                await delay(2000);
                entry();
            } else {
                BattleModuleManager.clearCurModule();
                BattleModuleManager.signDeliver.removeEventListener('bm_end', finish);
            }
        };
        BattleModuleManager.setCommonModule((info, skills, pets) => {
            BattleOperator.useSkill(NMS.match(skills));
        });
        BattleModuleManager.signDeliver.addEventListener('bm_end', finish);
        entry();
    }
}

export default {
    mod: gzcj3,
};
