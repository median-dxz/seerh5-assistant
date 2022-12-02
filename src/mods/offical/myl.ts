import data from '@data';
import * as saco from '@sa-core/index';
import { ReflectObjBase } from '../../assistant/mod-type';

import { defaultStyle, SaModuleLogger } from '../../assistant/logger';
const log = SaModuleLogger('莫伊莱因子', defaultStyle.mod);

const ct = data.petCts;
const { Functions, Utils, PetHelper } = saco;
const { delay } = window;

const Bags = [
    [
        { catchTime: ct.暴君史莱姆, name: '暴君史莱姆' },
        { catchTime: ct.芳馨·茉蕊儿, name: '芳馨·茉蕊儿' },
    ],
    [
        { catchTime: ct.幻影蝶, name: '幻影蝶' },
        { catchTime: ct.冰之契约·阿克希亚, name: '冰之契约·阿克希亚' },
        { catchTime: ct.邪灵主宰·摩哥斯, name: '邪灵主宰·摩哥斯' },
    ],
    [
        { catchTime: ct.魔钰, name: '魔钰' },
        { catchTime: ct.鲁肃, name: '鲁肃' },
        { catchTime: ct.潘克多斯, name: '潘克多斯' },
    ],
    [
        { catchTime: ct.神寂·克罗诺斯, name: '神寂·克罗诺斯' },
        { catchTime: ct.蒂朵, name: '蒂朵' },
        { catchTime: ct.六界帝神, name: '六界帝神' },
        { catchTime: ct.时空界皇, name: '时空界皇' },
    ],
];
const defaultPet = [ct.芳馨·茉蕊儿, ct.幻影蝶, ct.潘克多斯, ct.神寂·克罗诺斯];
const DSPs = [];
const NMSs = [];

class myl extends ReflectObjBase implements ModClass {
    meta = { description: '莫伊莱因子' };
    constructor() {
        super();
    }
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
        let c = new DataView(await Utils.SocketSendByQueue(42399, [1, 1723493]));
        this.activityInfo = {
            gears: c.getUint32(8),
            curBattle: (a >> 16) & 7,
            difficulty: (a >> 8) & 7,
            isInChallenging: Boolean(a & 7),
            dailyTimes: b,
        };
        log(`更新信息
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
            await new Promise<void>((res, rej) => {
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
                const code = new DataView(v).getUint32(0);
                if (code == 0) {
                    Utils.SocketSendByQueue(41282, [1, 2]);
                } else {
                    log(`当前阵容不能对战!请检查是否有不合法的精灵`);
                }
            });
        }
    }
}

export default {
    mod: myl,
};
