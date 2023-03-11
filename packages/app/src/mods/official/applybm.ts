import { Constant, Mod, SABattle, SAEngine, SAPetHelper, SaModuleLogger, defaultStyle, delay, lowerBlood, switchBag } from 'seerh5-assistant-core';

const log = SaModuleLogger('精灵因子', defaultStyle.mod);

declare namespace pvePetYinzi {
    const DataManager: any;
}

type Difficulty = Constant.PetFragmentLevelDifficulty;
const Difficulty = Constant.PetFragmentLevelDifficulty;

namespace PetFragment {
    export interface Option {
        difficulty: Difficulty;
        id: number;
        sweep: boolean;
        strategy: Array<{ cts: number[]; strategy: SABattle.MoveModule; beforeBattle: () => PromiseLike<void> }>;
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

        init(option: Option) {
            this.option = option;
            this.designId = option.id;
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
            let check = new DataView(checkData).getUint32(0);
            if (check === 0) {
                SAEngine.Socket.sendByQueue(41282, [this.designId, this.curDifficulty]);
            } else {
                BubblerManager.getInstance().showText(`出战情况不合法: ${check}`);
            }
        }
        async prepare() {
            let { cts, beforeBattle, strategy } = this.option.strategy[this.curPosition];
            await switchBag(cts);
            SAPetHelper.cureAllPet();
            await delay(300);
            await beforeBattle();
            SAPetHelper.setDefault(cts[0]);
            await delay(300);
            SABattle.Manager.strategy = strategy;
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
}

const moveModules: { [name: string]: SABattle.MoveModule } = {
    圣谱单挑: async (round, skills) => {
        const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
        if (r) {
            SABattle.Operator.useSkill(r.id);
        } else {
            SABattle.Operator.auto();
        }
    },
    圣谱单挑1: async (round, skills) => {
        const r = skills.find((skill) => skill.name === ['神灵之触', '神灵救世光'][round.round % 2]);
        if (r) {
            SABattle.Operator.useSkill(r.id);
        } else {
            SABattle.Operator.auto();
        }
    },
    潘朵必先: SABattle.generateStrategy(
        ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹'],
        ['潘克多斯', '蒂朵', '鲁肃', '魔钰', '月照星魂', '时空界皇']
    ),
    克朵六时: SABattle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇']
    ),
    克朵补刀: SABattle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝', '破寂同灾'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
    ),
    琉彩: async (round, skills, pets) => {
        const r = skills.find((skill) => skill.name === ['琴·万律归一', '朵·盛夏咏叹'][round.round % 2]);
        if (round.isDiedSwitch) {
            const dsl = new SABattle.DiedSwitchLink(['鲁肃', '芳馨·茉蕊儿', '蒂朵']);
            if (round.isDiedSwitch) {
                const r = dsl.match(pets, round.self!.catchtime);
                if (r !== -1) {
                    SABattle.Operator.switchPet(r);
                } else {
                    SABattle.Operator.auto();
                }
            }
            await delay(300);
            skills = SABattle.Provider.getCurSkills()!;
        }
        if (r) {
            SABattle.Operator.useSkill(r.id);
        } else {
            SABattle.Operator.auto();
        }
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
    圣谱单挑: { beforeBattle: async () => {}, cts: [1656092908], strategy: moveModules['圣谱单挑'] },
    圣谱单挑1: { beforeBattle: async () => {}, cts: [1656092908], strategy: moveModules['圣谱单挑1'] },
    琉彩: { beforeBattle: async () => {}, cts: [1655917820, 1656056275, 1656386598], strategy: moveModules['琉彩'] },
};

const options: PetFragment.Option[] = [
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
    // 黑沃德
    {
        difficulty: Difficulty.Ease,
        sweep: false,
        id: 77,
        strategy: [
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑'],
            perStrategy['圣谱单挑1'],
        ],
    },
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
];

class applyBm extends Mod {
    constructor() {
        super();
    }
    logDataByName(factorName: string) {
        let data = config.xml
            .getAnyRes('new_super_design')
            .Root.Design.find((r: any) => (r.Desc as string).match(factorName));
        log(data);
    }
    getCurPanelInfo() {
        log(pvePetYinzi.DataManager._instance.curYinziData);
    }
    init() {
        config.xml.load('new_super_design');
        config.xml.load('Fragment');
    }
    getRunner() {
        return new PetFragment.Runner();
    }
    async runAll() {
        const runners: PetFragment.Runner[] = [];

        for (let option of options) {
            runners.push(new PetFragment.Runner());
            runners.at(-1)?.init(option);
            await runners.at(-1)?.update();
        }
        for (let runner of runners) {
            while (runner.isChallenge || runner.leftChallengeTimes > 0) {
                if (runner.option.sweep) {
                    await runner.sweep();
                } else {
                    await runner.prepare();
                    await SABattle.Manager.runOnce(runner.battleOnce.bind(runner));
                }
                await runner.update();
                await delay(Math.round(Math.random() * 500) + 5000);
                SABattle.Manager.clear();
            }
        }
    }

    meta = { description: '' };
}

export default {
    mod: applyBm,
    id: 'applyBm',
};
