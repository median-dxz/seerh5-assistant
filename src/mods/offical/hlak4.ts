import * as saco from '../../assisant/core';
import { defaultStyle, SaModuleLogger } from '../../logger';
import * as data from '@data';

const { BattleModule, Utils, Functions, Const, PetHelper } = saco;
const { delay } = window;
const { petCts: ct, commonBattleModule: bm } = data.default;
const log = SaModuleLogger('Mod: 红莲安卡第四关', defaultStyle.mod);

const PetBags = [
    { catchTime: ct.神寂·克罗诺斯, name: '神寂·克罗诺斯' },
    { catchTime: ct.蒂朵, name: '蒂朵' },
    { catchTime: ct.六界帝神, name: '六界帝神' },
    { catchTime: ct.时空界皇, name: '时空界皇' },
];

const DSP = new BattleModule.BaseSkillModule.DiedSwitchLinked(bm.克朵六时.diedSwitchLink);
const NMS = new BattleModule.BaseSkillModule.NameMatched(bm.克朵六时.skillMatch);

interface ActivityInfo {
    红莲能量: number;
    红莲核心: number;
    当前位置: number;
    今日剩余次数: number;
}
export class hlak4 {
    _activityInfo = {} as ActivityInfo;

    _startFight() {
        return Utils.SocketSendByQueue(45787, [86, 4, 52, 1]);
    }
    _getAward() {
        return Utils.SocketSendByQueue(45787, [86, 4, 51, 5]);
    }
    constructor() {}
    async init() {
        this.update();
        await Functions.SwitchBag(PetBags);
        PetHelper.setDefault(ct.神寂·克罗诺斯);
        PetHelper.cureAllPet();
        await delay(200);
        log('初始化完成');
    }
    async runOnce() {
        await new Promise<void>((resolve, reject) => {
            Functions.LowerBlood([ct.神寂·克罗诺斯, ct.时空界皇], Const.ITEMS.Potion.中级体力药剂, () => {
                const self = this;
                const battleModule = {
                    entry() {
                        self._startFight();
                    },
                    skillModule: BattleModule.GenerateBaseBattleModule(NMS, DSP),
                    async finished() {
                        self.update();
                        PetHelper.cureAllPet();
                        await delay(200);
                        resolve();
                    },
                };
                BattleModule.ModuleManager.queuedModule(battleModule);
                BattleModule.ModuleManager.runOnce();
            });
        });
    }
    async run() {
        let i = this._activityInfo.今日剩余次数;
        while (i--) {
            await this.runOnce();
            if (this._activityInfo.当前位置 === 10) {
                await this._getAward();
                break;
            }
        }
    }
    async update() {
        const data = await Utils.GetMultiValue(107809, 107810, 107805, 12743);
        this._activityInfo = Object.assign(this._activityInfo, {
            红莲能量: data[0],
            当前位置: (data[1] >> 8) & 255,
            今日剩余次数: 10 - data[3],
        });
        console.table(this._activityInfo);
        return this._activityInfo;
    }
}

export default {
    mod: hlak4,
};
