import data from '@data';
import * as saco from '../../assistant/core';
import { ReflectObjBase } from '../../assistant/modloader';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('X战队密室', defaultStyle.mod);

const { BattleModule, Functions, PetHelper } = saco;
const { BaseSkillModule, ModuleManager: BattleModuleManager } = BattleModule;
const { delay } = window;
const ct = data.petCts;

const NMS = new BaseSkillModule.NameMatched(['幻梦芳逝', '剑挥四方', '破寂同灾']);
const DSP = new BaseSkillModule.DiedSwitchLinked(['蒂朵', '六界帝神', '深渊狱神·哈迪斯']);

class xms extends ReflectObjBase implements ModClass {
    meta = { description: 'X战队密室' };
    DataManager: any;
    constructor() {
        super();
    }
    activityInfo = {
        isFinished: false,
    };
    async update() {
        this.activityInfo.isFinished =
            this.DataManager.GetDailyRewardFlag() ||
            (this.DataManager.GetFbOpenFlag() === false && this.DataManager.GetDailyFBOpenCnt() === 3);
    }
    async init() {
        let pveXTeamRoom: any;
        if (!ModuleManager.hasmodule('pveXTeamRoom.PveXTeamRoom')) {
            await ModuleManager.showModule('pveXTeamRoom');
        }

        pveXTeamRoom = window['pveXTeamRoom'];

        await Functions.SwitchBag([
            { catchTime: ct.蒂朵, name: '蒂朵' },
            { catchTime: ct.深渊狱神·哈迪斯, name: '深渊狱神·哈迪斯' },
            { catchTime: ct.六界帝神, name: '六界帝神' },
        ]);

        PetHelper.cureAllPet();
        PetHelper.setDefault(ct.蒂朵);

        await delay(500);

        this.DataManager = pveXTeamRoom.DataManger.getInstance();
        await this.update();
        if (!this.activityInfo.isFinished) {
            if (!this.DataManager.GetFbOpenFlag()) {
                this.DataManager.c2s_Start_Fb();
            }
        } else {
            log('今日已结束!');
        }
    }
    run() {
        BattleModuleManager.queuedModule({
            entry: () => {
                this.DataManager.c2s_go_battle(7);
            },
            skillModule: BattleModule.GenerateBaseBattleModule(NMS, DSP),
            finished: () => {
                this.DataManager.c2s_Get_DailyReward();
            },
        });
        BattleModuleManager.runOnce();
    }
}
export default {
    mod: xms,
};
