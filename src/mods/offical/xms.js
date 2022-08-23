import * as saco from '../../proxy/core.js';
import data from '../common.config.js';

const { BattleModule, Const, Functions, PetHelper, Utils } = saco;
const { BaseSkillModule, BattleInfoProvider, BattleModuleManager, BattleOperator } = BattleModule;
const ct = data.petCts;

const NMS = new BaseSkillModule.NameMatched(['幻梦芳逝', '剑挥四方', '破寂同灾']);
const DSP = new BaseSkillModule.DiedSwitchLinked(['蒂朵', '六界帝神', '深渊狱神·哈迪斯']);

class xms {
    constructor() {}
    activityInfo = {
        isFinished: false,
    };
    async update() {
        this.activityInfo.isFinished = this.dm.GetDailyRewardFlag();
    }
    async init() {
        if (!ModuleManager.hasmodule('pveXTeamRoom.PveXTeamRoom')) {
            await ModuleManager.showModule('pveXTeamRoom');
        }

        await Functions.SwitchBag([
            { catchTime: ct.蒂朵, name: '蒂朵' },
            { catchTime: ct.深渊狱神·哈迪斯, name: '深渊狱神·哈迪斯' },
            { catchTime: ct.六界帝神, name: '六界帝神' },
        ]);

        PetHelper.cureAllPet();
        PetHelper.setDefault(ct.蒂朵);

        await delay(500);
        this.dm = pveXTeamRoom.DataManger.getInstance();
        await this.update();
        if (!this.activityInfo.isFinished) {
            if (!this.dm.GetFbOpenFlag()) {
                this.dm.c2s_Start_Fb();
            }
        } else {
            console.log('[x战队密室]: 今日已结束!');
        }
    }
    run() {
        BattleModuleManager.queuedModule(
            () => {
                this.dm.c2s_go_battle(7);
            },
            BattleModule.GenerateBaseBattleModule(NMS, DSP),
            () => {
                this.dm.c2s_Get_DailyReward();
            }
        );
        BattleModuleManager.runOnce();
    }
}
export default {
    mod: xms,
};
