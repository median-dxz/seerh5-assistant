import * as saco from '../../proxy/core.js';

let { Utils, BattleModule, delay, PetHelper, Functions, SAEventManager, Const } = saco;
let { BaseSkillModule, BattleInfoProvider, BattleOperator, BattleModuleManager } = BattleModule;

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
            defaultPet: 1656696029,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇']),
            skillList: new BaseSkillModule.NameMatched(['鬼哭神泣灭', '幻梦芳逝', '诸界混一击', '剑挥四方']),
            lowerbloodPets: [1655484346],
        },
        朵潘月照: {
            defaultPet: 1656056275,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['蒂朵', '潘克多斯', '月照星魂']),
            skillList: new BaseSkillModule.NameMatched(['幻梦芳逝', '鬼焰·焚身术', '月下华尔兹']),
            lowerbloodPets: [1657943113],
        },
        朵潘魔钰: {
            defaultPet: 1656056275,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['蒂朵', '潘克多斯', '魔钰']),
            skillList: new BaseSkillModule.NameMatched(['幻梦芳逝', '鬼焰·焚身术', '梦境残缺']),
            lowerbloodPets: [1655445699],
        },
        潘朵魔钰: {
            defaultPet: 1656383521,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['潘克多斯', '蒂朵', '魔钰']),
            skillList: new BaseSkillModule.NameMatched(['幻梦芳逝', '鬼焰·焚身术', '梦境残缺']),
            lowerbloodPets: [1655445699],
        },
        克朵魔钰第五: {
            defaultPet: 1656696029,
            diedLink: new BaseSkillModule.DiedSwitchLinked(['神寂·克罗诺斯', '蒂朵', '魔钰']),
            skillList: new BaseSkillModule.NameMatched(['鬼哭神泣灭', '幻梦芳逝', '哥特式幻想']),
            lowerbloodPets: [],
        },
    };

    actModDict = [
        '克朵六时', // uncheck
        '克朵六时',
        '潘朵魔钰',
        '潘朵魔钰',
        '克朵六时',
        '克朵魔钰第五', //ok
        '朵潘魔钰', // uncheck
        '克朵六时',
        '朵潘魔钰', // uncheck
        '潘朵魔钰', // uncheck
    ];
    constructor() {}

    async init() {
        for (let pet of PetHelper.getPets(7)) {
            await PetHelper.setPetLocation(pet.catchTime, 0);
            await delay(600);
        }
        await PetHelper.setPetLocation(1657863632, 7);
        await delay(600);

        await Functions.switchBag(
            Array.from({
                0: { catchTime: 1655445699, name: '魔钰', id: 3567 },
                1: { catchTime: 1655484346, name: '时空界皇', id: 3463 },
                2: { catchTime: 1656056275, name: '蒂朵', id: 4377 },
                3: { catchTime: 1656696029, name: '神寂·克罗诺斯', id: 2977 },
                4: { catchTime: 1656383521, name: '潘克多斯', id: 4344 },
                5: { catchTime: 1657943113, name: '月照星魂', id: 3866 },
                length: 6,
            })
        );

        Functions.CureAllPet();
        await this.moveStep();
        await delay(1000);
        console.log('[Mod:红莲安卡第三关]: 模组初始化完成');
    }

    async run() {}

    async runOnce() {
        const curModName = this.actModDict[this.activityInfo.curPos];
        const curMod = this.petsMod[curModName];
        const curPos = this.activityInfo.curPos;
        console.log('[Mod:红莲安卡第三关]:', curModName, curMod, curPos);

        if (curModName == '克朵六时') {
            await PetHelper.setPetLocation(1655445699, 7);
            await delay(600);
            await PetHelper.setPetLocation(1657943113, 7);
            await delay(600);
            await PetHelper.setPetLocation(1657863632, 1);
            await delay(600);
            await PetHelper.setPetLocation(1655484346, 1);
            await delay(600);
        } else {
            await PetHelper.setPetLocation(1657863632, 7);
            await delay(600);
            await PetHelper.setPetLocation(1655484346, 7);
            await delay(600);
            await PetHelper.setPetLocation(1655445699, 1);
            await delay(600);
            await PetHelper.setPetLocation(1657943113, 1);
            await delay(600);
        }

        Functions.CureAllPet();
        await delay(600);
        await new Promise((resolve, reject) => {
            Functions.LowerBlood(curMod.lowerbloodPets, Const.ITEMS.Potion.高级体力药剂, async () => {
                PetHelper.setDefault(curMod.defaultPet);
                await delay(200);
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
                    next == -1 ? BattleOperator.escape() : BattleOperator.switchPet(next);
                    await delay(800);
                    skills = BattleInfoProvider.getCurSkills();
                }
                BattleOperator.useSkill(curMod.skillList.match(skills));
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
            }
        );
        BattleModuleManager.runOnce();
    }
}

export default {
    mod: hlak,
};
