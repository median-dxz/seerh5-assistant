import { BaseMod } from '@sa-app/mod-manager/mod-type';

import {
    PetFragmentLevelDifficulty as Difficulty,
    NULL,
    SaModuleLogger,
    cureAllPet,
    defaultStyle,
    delay,
    lowerBlood,
    switchBag,
} from 'sa-core';

import type { MoveModule } from 'sa-core/battle';
import * as SABattle from 'sa-core/battle';
import * as SAEngine from 'sa-core/engine';

const log = SaModuleLogger('精灵因子', defaultStyle.mod);

declare namespace pvePetYinzi {
    const DataManager: unknown;
}

export interface Option {
    difficulty: Difficulty;
    id: number;
    sweep: boolean;
    strategy: Array<{ cts: number[]; strategy: MoveModule; beforeBattle: () => PromiseLike<void> }>;
}

export class Runner {
    configData: SAType.PetFragmentLevelObj;
    option: Option;
    pieces: number;
    bosses: SAType.PetFragmentLevelBoss[];
    isChallenge: boolean;
    curDifficulty: Difficulty;
    leftChallengeTimes: number;
    failedTimes: number;
    curPosition: number;
    designId: number;
    strategy: MoveModule;

    init(option: Option) {
        this.option = option;
        this.designId = option.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.configData = config.xml.getAnyRes('new_super_design').Root.Design.find((r: any) => r.ID === option.id);
    }
    openPanel() {
        ModuleManager.showModuleByID(151, `{Design:${this.designId}}`);
    }
    async sweep() {
        await SAEngine.Socket.sendByQueue(41283, [this.designId, 4 + this.curDifficulty]);
        log('执行一次扫荡');
    }
    async battleOnce() {
        const checkData = await SAEngine.Socket.sendByQueue(41284, [this.designId, this.curDifficulty]);
        const check = new DataView(checkData!).getUint32(0);
        if (check === 0) {
            SAEngine.Socket.sendByQueue(41282, [this.designId, this.curDifficulty]);
        } else {
            BubblerManager.getInstance().showText(`出战情况不合法: ${check}`);
        }
    }
    async prepare() {
        const { cts, beforeBattle, strategy } = this.option.strategy[this.curPosition];
        await switchBag(cts);
        cureAllPet();
        await delay(300);
        await beforeBattle();
        PetManager.setDefault(cts[0]);
        await delay(2000);
        this.strategy = strategy;
    }
    async update() {
        const values = await SAEngine.Socket.multiValue(
            this.configData.Configure.TimeValue,
            this.configData.Configure.FailTimes,
            this.configData.Configure.ProgressValue
        );
        ItemManager.updateItemNum([this.configData.Reward.ItemID], [true]);
        this.pieces = ItemManager.getNumByID(this.configData.Reward.ItemID);
        this.leftChallengeTimes = this.configData.Configure.Times - values[0];
        this.failedTimes = values[1];
        this.curDifficulty = (values[2] >> 8) & 255;
        if (this.curDifficulty === Difficulty.NotSelected && this.option.difficulty) {
            this.curDifficulty = this.option.difficulty;
        }
        this.curPosition = values[2] >> 16;
        this.isChallenge = this.curDifficulty !== 0 && this.curPosition !== 0;
        switch (this.curDifficulty) {
            case Difficulty.Ease:
                this.bosses = this.configData.EasyBattle.Task;
                break;
            case Difficulty.Normal:
                this.bosses = this.configData.NormalBattle.Task;
                break;
            case Difficulty.Hard:
                this.bosses = this.configData.HardBattle.Task;
                break;
            default:
                break;
        }
    }
}

const moveModules: { [name: string]: SABattle.MoveModule } = {
    圣谱单挑: {
        resolveMove: (round, skills) => {
            const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
            return SABattle.Operator.useSkill(r?.id);
        },
        resolveNoBlood: NULL,
    },
    王哈单挑: {
        resolveMove: (round, skills) => {
            const r = skills.find((skill) => skill.name === ['狂龙击杀', '龙子诞生'][round.round % 2]);
            return SABattle.Operator.useSkill(r?.id);
        },
        resolveNoBlood: NULL,
    },
    圣谱单挑1: {
        resolveMove: (round, skills) => {
            const r = skills.find((skill) => skill.name === ['神灵之触', '神灵救世光'][round.round % 2]);
            return SABattle.Operator.useSkill(r?.id);
        },
        resolveNoBlood: NULL,
    },
    潘朵必先: SABattle.generateStrategy(
        ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹'],
        ['潘克多斯', '蒂朵', '鲁肃', '魔钰', '月照星魂', '时空界皇']
    ),
    潘蒂表必先: SABattle.generateStrategy(
        ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹', '守御八方'],
        ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇']
    ),
    克朵六时: SABattle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇']
    ),
    克朵补刀: SABattle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝', '破寂同灾'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
    ),
    琉彩: {
        resolveNoBlood: (round, _skills, pets) => {
            const dsl = new SABattle.NoBloodSwitchLink(['鲁肃', '芳馨·茉蕊儿', '蒂朵']);
            return dsl.match(pets, round.self!.catchtime);
        },
        resolveMove: (round, skills, _pets) => {
            const r = skills.find((skill) => skill.name === ['琴·万律归一', '朵·盛夏咏叹'][round.round % 2]);
            return SABattle.Operator.useSkill(r?.id);
        },
    },
    潘朵索: SABattle.generateStrategy(
        ['鬼焰·焚身术', '幻梦芳逝', '烈火净世击'],
        ['潘克多斯', '蒂朵', '混沌魔君索伦森']
    ),
};

const perStrategy: {
    [key: string]: { cts: number[]; strategy: SABattle.MoveModule; beforeBattle: () => PromiseLike<void> };
} = {
    克朵六时: {
        beforeBattle: async () => {
            await lowerBlood([1655484346]);
        },
        cts: [1656696029, 1656056275, 1657863632, 1655484346],
        strategy: moveModules['克朵六时'],
    },
    潘朵必先: {
        beforeBattle: async () => {
            await lowerBlood([1656383521, 1656056275, 1655917820, 1655445699, 1655484346, 1657943113]);
        },
        cts: [1656383521, 1656056275, 1655917820, 1655445699, 1655484346, 1657943113],
        strategy: moveModules['潘朵必先'],
    },
    潘蒂表必先: {
        beforeBattle: async () => {
            await lowerBlood([1656383521, 1656056275, 1675323310, 1655445699, 1655484346, 1657943113]);
        },
        cts: [1656383521, 1656056275, 1675323310, 1655445699, 1655484346, 1657943113],
        strategy: moveModules['潘蒂表必先'],
    },
    圣谱单挑: {
        beforeBattle: async () => {
            /* do nothing */
        },
        cts: [1656092908],
        strategy: moveModules['圣谱单挑'],
    },
    王哈单挑: {
        beforeBattle: async () => {
            /* do nothing */
        },
        cts: [1656302059],
        strategy: moveModules['王哈单挑'],
    },
    圣谱单挑1: {
        beforeBattle: async () => {
            /* do nothing */
        },
        cts: [1656092908],
        strategy: moveModules['圣谱单挑1'],
    },
    琉彩: {
        beforeBattle: async () => {
            /* do nothing */
        },
        cts: [1655917820, 1656056275, 1656386598],
        strategy: moveModules['琉彩'],
    },
};

const options: Option[] = [
    // 琉彩2
    // {
    //     difficulty: PetFragment.LevelDifficulty.Ease,
    //     sweep: false,
    //     id: 84,
    //     strategy: [
    //         perStrategy['圣谱单挑'],
    //         perStrategy['圣谱单挑'],
    //         perStrategy['圣谱单挑'],
    //         perStrategy['圣谱单挑'],
    //         perStrategy['琉彩'],
    //     ],
    // },
    // 特罗斯2
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 56,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
        ],
    },
    // 萝卜丝
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 14,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['潘蒂表必先'],
        ],
    },
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 79,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['潘蒂表必先'],
        ],
    },
    // 格斯塔斯
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 82,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['潘蒂表必先'],
            perStrategy['潘蒂表必先'],
        ],
    },
    // 启明星
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 86,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['王哈单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['潘蒂表必先'],
        ],
    },
    // 嫉妒
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 95,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['潘蒂表必先'],
        ],
    },
];

class applyBm extends BaseMod {
    constructor() {
        super();
    }
    logDataByName(factorName: string) {
        const data = config.xml
            .getAnyRes('new_super_design')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .Root.Design.find((r: any) => (r.Desc as string).match(factorName));
        log(data);
    }
    getCurPanelInfo() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log((pvePetYinzi.DataManager as any)._instance.curYinziData);
    }
    init() {
        // do nothing
    }
    getRunner() {
        return new Runner();
    }
    async runAll() {
        const runners: Runner[] = [];

        for (const option of options) {
            runners.push(new Runner());
            runners.at(-1)?.init(option);
            await runners.at(-1)?.update();
        }
        for (const runner of runners) {
            SAEngine.toggleAutoCure(false);
            await delay(50);
            while (runner.isChallenge || runner.leftChallengeTimes > 0) {
                if (runner.option.sweep) {
                    await runner.sweep();
                } else {
                    await runner.prepare();
                    await SABattle.Manager.runOnce(runner.battleOnce.bind(runner), runner.strategy);
                }
                await runner.update();
                await delay(Math.round(Math.random() * 100) + 5000);
                SABattle.Manager.clear();
            }
            SAEngine.toggleAutoCure(true);
            await delay(50);
        }
    }

    meta = { description: '', id: 'applyBm' };
}

export default applyBm;
