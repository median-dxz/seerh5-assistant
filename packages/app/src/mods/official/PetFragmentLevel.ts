import { BaseMod } from '@sa-app/mod-manager/mod-type';

import {
    PetFragmentLevelDifficulty as Difficulty,
    ILevelBattleStrategy,
    ILevelRunner,
    NULL,
    SALevelManager,
    SALevelState,
    SaModuleLogger,
    defaultStyle,
    delay,
    lowerBlood,
} from 'sa-core';

import { IPFLevelBoss, IPetFragmentLevelObject, PetFragmentLevel } from 'sa-core/entity';
import type { SALevelConfig, SALevelData } from 'sa-core/level';

import * as SABattle from 'sa-core/battle';
import * as SAEngine from 'sa-core/engine';

const log = SaModuleLogger('精灵因子', defaultStyle.mod);

declare namespace pvePetYinzi {
    const DataManager: unknown;
}

interface Config extends SALevelConfig, IPetFragmentLevelObject {
    designId: number;
}

interface LevelData extends SALevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}

interface Option {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    strategy: ILevelBattleStrategy[];
}

export class PetFragmentRunner implements ILevelRunner<LevelData, Config> {
    data: LevelData;
    config: Config;
    option: Option;
    logger: (msg: string) => void;

    constructor(option: Option) {
        this.option = option;
        this.option.strategy = this.option.strategy.map((strategy) => {
            const beforeBattle = async () => {
                await delay(Math.round(Math.random() * 100) + 5000);
                return strategy.beforeBattle?.();
            };
            return { ...strategy, beforeBattle };
        });

        const LevelObj: SAType.PetFragmentLevelObj = config.xml
            .getAnyRes('new_super_design')
            .Root.Design.find((r: SAType.PetFragmentLevelObj) => r.ID === option.id);

        const level = new PetFragmentLevel(LevelObj);

        this.config = {
            ...level,
            designId: level.id,
            maxTimes: level.totalTimes,
        };
        this.data = { success: false } as LevelData;

        this.logger = SaModuleLogger(`精灵因子-${this.config.name}`, defaultStyle.mod);
    }

    selectStrategy() {
        return this.option.strategy.at(this.data.curPosition)!;
    }

    async updater() {
        const { config, data } = this;
        const values = await SAEngine.Socket.multiValue(
            config.values.openTimes,
            config.values.failTimes,
            config.values.progress
        );

        data.pieces = await SAEngine.getItemNum(this.config.petFragmentItem);

        data.leftTimes = this.config.maxTimes - values[0];
        data.failedTimes = values[1];
        data.curDifficulty = (values[2] >> 8) & 255;
        if (data.curDifficulty === Difficulty.NotSelected && this.option.difficulty) {
            data.curDifficulty = this.option.difficulty;
        }
        data.curPosition = values[2] >> 16;
        data.isChallenge = data.curDifficulty !== 0 && data.curPosition !== 0;
        switch (data.curDifficulty) {
            case Difficulty.Ease:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Normal:
                data.bosses = config.level.ease;
                break;
            case Difficulty.Hard:
                data.bosses = config.level.ease;
                break;
            default:
                break;
        }
        this.data = { ...this.data };

        if (data.isChallenge || data.leftTimes > 0) {
            if (this.option.sweep) {
                return 'sweep' as unknown as SALevelState;
            } else {
                return SALevelState.BATTLE;
            }
        } else {
            this.data.success = true;
            return SALevelState.STOP;
        }
    }

    readonly actions: Record<string, () => Promise<void>> = {
        sweep: async () => {
            await SAEngine.Socket.sendByQueue(41283, [this.config.designId, 4 + this.data.curDifficulty]);
            this.logger('执行一次扫荡');
        },
        battle: async () => {
            const checkData = await SAEngine.Socket.sendByQueue(41284, [this.config.designId, this.data.curDifficulty]);
            const check = new DataView(checkData!).getUint32(0);
            if (check === 0) {
                SAEngine.Socket.sendByQueue(41282, [this.config.designId, this.data.curDifficulty]);
            } else {
                const err = `出战情况不合法: ${check}`;
                BubblerManager.getInstance().showText(err);
                throw new Error(err);
            }
        },
    };

    openPanel() {
        ModuleManager.showModuleByID(151, `{Design:${this.config.designId}}`);
    }
}

const strategies: { [name: string]: SABattle.MoveStrategy } = {
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
    蒂朵单挑: {
        resolveMove: (round, skills) => {
            let r;
            if (round.round === 0) {
                r = skills.find((skill) => skill.name === '时空牵绊');
            } else {
                r = skills.find((skill) => skill.name === ['朵·盛夏咏叹', '灵籁之愿'][round.round % 2]);
            }
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

const perStrategy: Record<string, ILevelBattleStrategy> = {
    克朵六时: {
        beforeBattle: async () => {
            await lowerBlood([1655484346]);
        },
        pets: [1656696029, 1656056275, 1657863632, 1655484346],
        strategy: strategies['克朵六时'],
    },
    潘朵必先: {
        beforeBattle: async () => {
            await lowerBlood([1656383521, 1656056275, 1655917820, 1655445699, 1655484346, 1657943113]);
        },
        pets: [1656383521, 1656056275, 1655917820, 1655445699, 1655484346, 1657943113],
        strategy: strategies['潘朵必先'],
    },
    潘蒂表必先: {
        beforeBattle: async () => {
            await lowerBlood([1656383521, 1656056275, 1675323310, 1655445699, 1655484346, 1657943113]);
        },
        pets: [1656383521, 1656056275, 1675323310, 1655445699, 1655484346, 1657943113],
        strategy: strategies['潘蒂表必先'],
    },
    圣谱单挑: {
        pets: [1656092908],
        strategy: strategies['圣谱单挑'],
    },
    王哈单挑: {
        pets: [1656302059],
        strategy: strategies['王哈单挑'],
    },
    圣谱单挑1: {
        pets: [1656092908],
        strategy: strategies['圣谱单挑1'],
    },
    蒂朵单挑: {
        pets: [1656056275],
        strategy: strategies['蒂朵单挑'],
    },
    琉彩: {
        pets: [1655917820, 1656056275, 1656386598],
        strategy: strategies['琉彩'],
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
    // 卫岳
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 103,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['蒂朵单挑'],
            perStrategy['潘蒂表必先'],
        ],
    },
];

class applyBm extends BaseMod {
    ins: SALevelManager;

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
        this.ins = SALevelManager.ins;
    }

    async runAll() {
        const runners: PetFragmentRunner[] = [];
        for (const option of options) {
            runners.push(new PetFragmentRunner(option));
        }
        for (const runner of runners) {
            SALevelManager.ins.run(runner);
            await SALevelManager.ins.locker;
        }
    }

    meta = { description: '', id: 'applyBm' };
}

export default applyBm;