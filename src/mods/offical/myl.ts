import * as saco from '../../assisant/core';
import data from '../common.config.js';

const ct = data.petCts;
const { BattleModule, Functions, Utils, PetHelper} = saco;
const { BaseSkillModule } = BattleModule;

const Bags = [
    [
        { catchTime: ct.暴君史莱姆, name: '暴君史莱姆', id: 3522 },
        { catchTime: ct.芳馨·茉蕊儿, name: '芳馨·茉蕊儿', id: 3613 },
    ],
    [
        { catchTime: ct.幻影蝶, name: '幻影蝶', id: 2724 },
        { catchTime: ct.冰之契约·阿克希亚, name: '冰之契约·阿克希亚', id: 3699 },
        { catchTime: ct.邪灵主宰·摩哥斯, name: '邪灵主宰·摩哥斯', id: 3561 },
    ],
    [
        { catchTime: ct.魔钰, name: '魔钰', id: 3567 },
        { catchTime: ct.鲁肃, name: '鲁肃', id: 3540 },
        { catchTime: ct.潘克多斯, name: '潘克多斯', id: 3540 },
    ],
    [
        { catchTime: ct.神寂·克罗诺斯, name: '神寂·克罗诺斯', id: 4377 },
        { catchTime: ct.蒂朵, name: '蒂朵', id: 4377 },
        { catchTime: ct.六界帝神, name: '六界帝神', id: 4377 },
        { catchTime: ct.时空界皇, name: '时空界皇', id: 4377 },
    ],
];
const defaultPet = [ct.芳馨·茉蕊儿, ct.幻影蝶, ct.潘克多斯, ct.神寂·克罗诺斯];
const DSPs = [];
const NMSs = [];

class myl {
    constructor() {}
    init() {}
    activityInfo = {
        curBattle: 0,
        gears: 0,
        difficulty: 0,
        isInChallenging: false,
        dailyTimes: 0,
    };
    async updateActivityInfo() {
        const [a, b] = await Utils.GetMultiValue(107767, 12713);
        let c = await Utils.SocketSendByQueue(42399, [1, 1723493]);
        c = c.data;
        c.readUnsignedInt();
        c.readUnsignedInt();
        c = c.readUnsignedInt();
        this.activityInfo = {
            gears: c,
            curBattle: (a >> 16) & 7,
            difficulty: (a >> 8) & 7,
            isInChallenging: a & 7,
            dailyTimes: b,
        };
        console.log(`[莫伊莱因子]: 更新信息
            命运齿轮数: ${this.activityInfo.gears}
            当前战斗位置: ${this.activityInfo.curBattle}
            当前难度: ${this.activityInfo.difficulty}
            是否挑战中: ${this.activityInfo.isInChallenging}
            今日进行次数: ${this.activityInfo.dailyTimes}
        `);
        return this.activityInfo;
    }
    async runOnce() {
        await this.updateActivityInfo();
        if (this.activityInfo.dailyTimes <= 3) {
            const i = this.activityInfo.curBattle;
            await Functions.SwitchBag(Bags[i]);
            PetHelper.cureAllPet();
            await new Promise((res, rej) => {
                if (i == 2) {
                    Functions.LowerBlood([ct.魔钰], undefined, () => {
                        PetHelper.setDefault(defaultPet[i]);
                        res();
                    });
                } else if (i == 3) {
                    Functions.LowerBlood([ct.时空界皇], undefined, () => {
                        PetHelper.setDefault(defaultPet[i]);
                        res();
                    });
                } else {
                    PetHelper.setDefault(defaultPet[i]);
                    delay(200).then(() => {
                        res();
                    });
                }
            });

            Utils.SocketSendByQueue(41284, [1, 2]).then((v) => {
                const code = v.data.readUnsignedInt();
                if (code == 0) {
                    Utils.SocketSendByQueue(41282, [1, 2]);
                } else {
                    console.log(`[莫伊莱]: 当前阵容不能对战!请检查是否有不合法的精灵`);
                }
            });
        }
    }
}

export default {
    mod: myl,
};
