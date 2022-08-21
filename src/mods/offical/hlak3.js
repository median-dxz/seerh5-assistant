import * as saco from '../../proxy/core.js';
import data from '../common.config.js';

const { Utils, BattleModule, PetHelper, Functions, SAEventManager, Const } = saco;
const { delay } = Utils;
const { BaseSkillModule, BattleInfoProvider, BattleOperator, BattleModuleManager } = BattleModule;
const ct = data.petCts;
const PosType = Const.PETPOS;

class hlak {
    //设置关卡信息
    updateActivityInfo = async () => {
        const v = (await Utils.GetMultiValue(107808))[0];
        this.activityInfo = {
            fireFroceNum: v & ((1 << 16) - 1),
            fightEnd: (v >> 20) & 15,
            curPos: (v >> 16) & 15,
            dailyTimes: 10 - (await Utils.GetMultiValue(12742))[0],
        };
        return this.activityInfo;
    };

    moveStep = async () => {
        if ((await this.updateActivityInfo()).fightEnd) {
            Utils.SocketSendByQueue(45787, [86, 3, 49, 3]);
            console.log(`[Mod:红莲安卡第三关]: 前进一步`);
        } else {
            console.log('[Mod:红莲安卡第三关]: 还未击败当前boss');
        }
    };

    startFight = async () => {
        if ((await this.updateActivityInfo()).fightEnd) {
            console.log('[Mod:红莲安卡第三关]: 已击败当前boss!');
        } else {
            console.log('[Mod:红莲安卡第三关]: 正在进入战斗');
            Utils.SocketSendByQueue(45787, [86, 3, 49, 1]);
        }
    };

    activityInfo = {
        fireFroceNum: 0,
        fightEnd: 0,
        curPos: 0,
        dailyTimes: 0,
    };

    petsMod = {
        克朵六时: {
            defaultPet: ct['神寂·克罗诺斯'],
            diedLink: new BaseSkillModule.DiedSwitchLinked(['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇']),
            skillList: new BaseSkillModule.NameMatched(['鬼哭神泣灭', '幻梦芳逝', '诸界混一击', '剑挥四方']),
            lowerbloodPets: [ct['神寂·克罗诺斯'], ct.时空界皇],
        },
        朵潘月照: {
            defaultPet: ct.蒂朵,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['蒂朵', '潘克多斯', '月照星魂', '魔钰']),
            skillList: new BaseSkillModule.NameMatched(['幻梦芳逝', '鬼焰·焚身术', '梦境残缺', '月下华尔兹']),
            lowerbloodPets: [ct.魔钰, ct.潘克多斯, ct.蒂朵, ct.月照星魂],
        },
        朵潘魔钰: {
            defaultPet: ct.蒂朵,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['蒂朵', '潘克多斯', '魔钰', '月照星魂']),
            skillList: new BaseSkillModule.NameMatched(['幻梦芳逝', '鬼焰·焚身术', '梦境残缺', '月下华尔兹']),
            lowerbloodPets: [ct.魔钰, ct.潘克多斯, ct.蒂朵, ct.月照星魂],
        },
        鲁肃圣谱: {
            defaultPet: ct.鲁肃,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['鲁肃', '圣灵谱尼']),
            skillList: new BaseSkillModule.NameMatched(['踏浪听风吟', '神灵救世光']),
            lowerbloodPets: [ct.鲁肃],
        },
        鲁肃千裳: {
            defaultPet: ct.鲁肃,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['鲁肃', '千裳']),
            skillList: new BaseSkillModule.NameMatched(['踏浪听风吟', '浮梦千裳诀']),
            lowerbloodPets: [ct.鲁肃],
        },
        克朵魔钰第五: {
            defaultPet: ct['神寂·克罗诺斯'],
            diedLink: new BaseSkillModule.DiedSwitchLinked(['神寂·克罗诺斯', '蒂朵', '魔钰']),
            skillList: new BaseSkillModule.NameMatched(['鬼哭神泣灭', '幻梦芳逝', '哥特式幻想']),
            lowerbloodPets: [ct['神寂·克罗诺斯']],
        },
    };

    actModDict = [
        '鲁肃千裳',
        '克朵六时',
        '鲁肃圣谱',
        '朵潘月照',
        '克朵六时',
        '克朵魔钰第五',
        '朵潘月照',
        '克朵六时',
        '朵潘月照',
        '朵潘魔钰',
    ];
    constructor() {}

    async init() {
        for (let pet of PetHelper.getPets(PosType.secondBag1)) {
            await PetHelper.setPetLocation(pet.catchTime, PosType.storage);
        }
        await PetHelper.setPetLocation(ct.神寂·克罗诺斯, PosType.secondBag1);
        await PetHelper.setPetLocation(ct.鲁肃, PosType.secondBag1);

        await Functions.SwitchBag([
            { catchTime: ct.魔钰, name: '魔钰', id: 3567 },
            { catchTime: ct.时空界皇, name: '时空界皇', id: 3463 },
            { catchTime: ct.蒂朵, name: '蒂朵', id: 4377 },
            { catchTime: ct.六界帝神, name: '六界帝神', id: 2977 },
            { catchTime: ct.潘克多斯, name: '潘克多斯', id: 4344 },
            { catchTime: ct.月照星魂, name: '月照星魂', id: 3866 },
        ]);

        Functions.CureAllPet();
        await this.updateActivityInfo();
        await this.moveStep();
        await this.updateActivityInfo();
        await delay(1000);
        console.log('[Mod:红莲安卡第三关]: 模组初始化完成');
        console.log('[Mod:红莲安卡第三关]: 请手动检查绿火/月照特攻珠/保底的王哈！');
    }

    async run() {}

    async runOnce() {
        const curModName = this.actModDict[this.activityInfo.curPos];
        const curMod = this.petsMod[curModName];
        const curPos = this.activityInfo.curPos;
        console.log('[Mod:红莲安卡第三关]:', curModName, curMod, curPos);

        if (curModName == '克朵六时') {
            await PetHelper.setPetLocation(ct.魔钰, PosType.secondBag1);
            await PetHelper.setPetLocation(ct.月照星魂, PosType.secondBag1);
            await PetHelper.setPetLocation(ct.六界帝神, PosType.bag1);
            await PetHelper.setPetLocation(ct.时空界皇, PosType.bag1);
        } else {
            await PetHelper.setPetLocation(ct.六界帝神, PosType.secondBag1);
            await PetHelper.setPetLocation(ct.时空界皇, PosType.secondBag1);
            await PetHelper.setPetLocation(ct.魔钰, PosType.secondBag1);
            await PetHelper.setPetLocation(ct.月照星魂, PosType.secondBag1);
            if (curModName == '鲁肃圣谱') {
                await PetHelper.setPetLocation(ct.圣灵谱尼, PosType.bag1);
                await PetHelper.setPetLocation(ct.鲁肃, PosType.bag1);
            } else if (curModName == '鲁肃千裳') {
                await PetHelper.setPetLocation(ct.千裳, PosType.bag1);
                await PetHelper.setPetLocation(ct.鲁肃, PosType.bag1);
            } else {
                await PetHelper.setPetLocation(ct.魔钰, PosType.bag1);
                await PetHelper.setPetLocation(ct.月照星魂, PosType.bag1);
            }
        }

        Functions.CureAllPet();
        await delay(200);
        await new Promise((resolve, reject) => {
            Functions.LowerBlood(curMod.lowerbloodPets, Const.ITEMS.Potion.高级体力药剂, async () => {
                PetHelper.setDefault(curMod.defaultPet);
                await delay(1000);
                resolve();
            });
        });

        BattleModuleManager.queuedModule(
            async () => {
                this.startFight();
            },
            async (info, skills, pets) => {
                if (info.isDiedSwitch) {
                    let next = curMod.diedLink.match(pets, info.pet.ct);
                    if (next != -1) {
                        BattleOperator.switchPet(next);
                        await delay(800);
                        skills = BattleInfoProvider.getCurSkills();
                    } else {
                        skills = [];
                    }
                }
                const skillId = curMod.skillList.match(skills);
                if (skillId > 0) BattleOperator.useSkill(skillId);
            },
            async () => {
                await this.moveStep();
                await delay(200);
                await this.updateActivityInfo();
                console.log(
                    `[Mod:红莲安卡第三关]: 
                    当前位置: ${this.activityInfo.curPos}
                    当前火焰原力: ${this.activityInfo.fireFroceNum}
                    是否战斗完成: ${this.activityInfo.fightEnd}
                    今日剩余次数: ${this.activityInfo.dailyTimes}
                    `
                );
                if (curModName.includes('鲁肃')) {
                    await PetHelper.popPetsFromBag(ct.鲁肃);
                    await PetHelper.popPetsFromBag(ct.圣灵谱尼);
                    await PetHelper.popPetsFromBag(ct.千裳);
                }
            }
        );
        BattleModuleManager.runOnce();
    }
}

export default {
    mod: hlak,
};
