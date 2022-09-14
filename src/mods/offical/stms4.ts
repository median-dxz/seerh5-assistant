// 42023 1 1000156
import * as saco from '../../assisant/core';
import data from '@data';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('Mod:圣瞳缪斯第四关', defaultStyle.mod);

const { petCts: ct } = data;
const { delay } = window;
const { BattleModule, Functions, PetHelper, Const, Utils } = saco;

const LevelConst = {
    fightId: [10838, 10839],
    itemId: [1714501, 1714502],
    dsp: new BattleModule.BaseSkillModule.DiedSwitchLinked([
        '潘克多斯',
        '蒂朵',
        '鲁肃',
        '月照星魂',
        '时空界皇',
        '魔钰',
    ]),
    nms: new BattleModule.BaseSkillModule.NameMatched([
        '幻梦芳逝',
        '鬼焰·焚身术',
        '梦境残缺',
        '踏浪听风吟',
        '月下华尔兹',
        '诸界混一击',
    ]),
    bag: [
        { catchTime: ct.潘克多斯, name: '潘克多斯' },
        { catchTime: ct.蒂朵, name: '蒂朵' },
        { catchTime: ct.魔钰, name: '魔钰' },
        { catchTime: ct.月照星魂, name: '月照星魂' },
        { catchTime: ct.时空界皇, name: '时空界皇' },
        { catchTime: ct.鲁肃, name: '鲁肃' },
    ],
};

interface ActivityInfo {
    圣瞳宝钻: number;
    圣瞳光灵: number;
    今日剩余挑战次数: number;
}

class stms4 {
    _activityInfo = {} as ActivityInfo;
    async update() {
        Utils.UpdateItemValues(...LevelConst.itemId);
        this._activityInfo = {
            今日剩余挑战次数: 6 - (await Utils.GetMultiValue(13341))[0],
            圣瞳宝钻: ItemManager.getNumByID(LevelConst.itemId[0]),
            圣瞳光灵: ItemManager.getNumByID(LevelConst.itemId[1]),
        };
        log(this._activityInfo);
        return this._activityInfo;
    }
    constructor() {}
    async init() {
        await Functions.SwitchBag(LevelConst.bag);
        const cts = LevelConst.bag.map((v) => v.catchTime);
        this.update();
        await new Promise<void>((resolve) => {
            Functions.LowerBlood(cts, undefined, () => {
                PetHelper.setDefault(ct.潘克多斯);
                resolve();
            });
        });
    }
    async run() {
        const cts = LevelConst.bag.map((v) => v.catchTime);
        const skimod = BattleModule.GenerateBaseBattleModule(LevelConst.nms, LevelConst.dsp);
        for (let i = 1; i <= 3; i++) {
            const finished = async () => {
                for (let ct of cts) {
                    if (PetManager.getPetInfo(ct).hp == 0) {
                        Functions.UsePotionForPet(ct, Const.ITEMS.Potion.中级体力药剂);
                        await delay(200);
                    }
                    Functions.UsePotionForPet(ct, Const.ITEMS.Potion.中级活力药剂);
                    await delay(200);
                }
            };
            BattleModule.ModuleManager.queuedModule({
                entry: () => {
                    FightManager.fightNoMapBoss(LevelConst.fightId[0]);
                },
                finished: finished,
                skillModule: skimod,
            });
            BattleModule.ModuleManager.queuedModule({
                entry: () => {
                    FightManager.fightNoMapBoss(LevelConst.fightId[1]);
                },
                finished: finished,
                skillModule: skimod,
            });
        }
    }
}
export default {
    mod: stms4,
};
