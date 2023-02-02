import { AutoBattle } from '@sa-core/battle/index';
import { delay } from '@sa-core/common';
import { Battle, Functions, PetHelper, Utils } from '@sa-core/index';
import { defaultStyle, SaModuleLogger } from '@sa-core/logger';
import { ReflectObjBase } from '@sa-core/mod-type';

const log = SaModuleLogger('精灵因子', defaultStyle.mod);

declare namespace pvePetYinzi {
    const DataManager: any;
}

namespace PetFactor {
    export enum LevelDifficulty {
        NotSelected = 0,
        Ease = 1,
        Hard = 2,
        Hell = 3,
    }
    interface Boss {
        BattleBoss: number;
        BossID: number;
        Desc: string;
        ID: number;
    }
    interface LevelConfig {
        Configure: {
            Times: number;
            TimeValue: number;
            FailTimes: number;
            ProgressValue: number;
        };
        EasyBattle: { Task: Boss[] };
        NormalBattle: { Task: Boss[] };
        HardBattle: { Task: Boss[] };
        Reward: {
            ItemID: number;
        };
    }
    export interface Option {
        difficulty: LevelDifficulty;
        id: number;
        sweep: boolean;
        strategy: Array<{ cts: number[]; strategy: AutoBattle.MoveModule; beforeBattle: () => PromiseLike<void> }>;
    }

    export class Runner {
        configData: LevelConfig;
        option: Option;
        pieces: number;
        bosses: Boss[];
        isChallenge: boolean;
        curDifficulty: LevelDifficulty;
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
            await Utils.SocketSendByQueue(41283, [this.designId, 4 + this.curDifficulty]);
            log('执行一次扫荡');
        }
        async battleOnce() {
            const checkData = await Utils.SocketSendByQueue(41284, [this.designId, this.curDifficulty]);
            let check = new DataView(checkData).getUint32(0);
            if (check === 0) {
                Utils.SocketSendByQueue(41282, [this.designId, this.curDifficulty]);
            } else {
                BubblerManager.getInstance().showText(`出战情况不合法: ${check}`);
            }
        }
        async prepare() {
            let { cts, beforeBattle, strategy } = this.option.strategy[this.curPosition];
            await Functions.switchBag(cts);
            PetHelper.cureAllPet();
            await delay(300);
            await beforeBattle();
            PetHelper.setDefault(cts[0]);
            await delay(300);
            Battle.Manager.strategy.custom = strategy;
        }
        async update() {
            const values = await Utils.GetMultiValue(
                this.configData.Configure.TimeValue,
                this.configData.Configure.FailTimes,
                this.configData.Configure.ProgressValue
            );
            ItemManager.updateItemNum([this.configData.Reward.ItemID], [true]);
            this.pieces = ItemManager.getNumByID(this.configData.Reward.ItemID);
            this.leftChallengeTimes = this.configData.Configure.Times - values[0];
            this.failedTimes = values[1];
            this.curDifficulty = (values[2] >> 8) & 255;
            if (this.curDifficulty === LevelDifficulty.NotSelected && this.option.difficulty) {
                this.curDifficulty = this.option.difficulty;
            }
            this.curPosition = values[2] >> 16;
            this.isChallenge = this.curDifficulty !== 0 && this.curPosition !== 0;
            switch (this.curDifficulty) {
                case LevelDifficulty.Ease:
                    this.bosses = this.configData.EasyBattle.Task;
                    break;
                case LevelDifficulty.Hard:
                    this.bosses = this.configData.NormalBattle.Task;
                    break;
                case LevelDifficulty.Hell:
                    this.bosses = this.configData.HardBattle.Task;
                    break;
                default:
                    break;
            }
        }
    }
}

const moveModules: { [name: string]: Battle.AutoBattle.MoveModule } = {
    圣谱单挑: async (round, skills) => {
        const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
        if (r) {
            Battle.Operator.useSkill(r.id);
        } else {
            Battle.Operator.auto();
        }
    },
    潘朵必先: Battle.generateStrategy(
        ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺'],
        ['潘克多斯', '蒂朵', '鲁肃', '魔钰', '时空界皇']
    ),
    克朵六时: Battle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇']
    ),
    克朵补刀: Battle.generateStrategy(
        ['诸界混一击', '剑挥四方', '幻梦芳逝', '破寂同灾'],
        ['神寂·克罗诺斯', '蒂朵', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
    ),
    蝶六时: Battle.generateStrategy(['诸界混一击', '剑挥四方', '竭血残蝶'], ['幻影蝶', '六界帝神', '时空界皇']),
    潘朵索: Battle.generateStrategy(['鬼焰·焚身术', '幻梦芳逝', '烈火净世击'], ['潘克多斯', '蒂朵', '混沌魔君索伦森']),
};

const perStrategy: {
    [key: string]: { cts: number[]; strategy: AutoBattle.MoveModule; beforeBattle: () => PromiseLike<void> };
} = {
    克朵六时: {
        beforeBattle: async () => {
            await Functions.lowerBlood([1655484346]);
        },
        cts: [1656696029, 1656056275, 1657863632, 1655484346],
        strategy: moveModules['克朵六时'],
    },
    蝶六时: {
        beforeBattle: async () => {},
        cts: [1656055512, 1657863632, 1655484346],
        strategy: moveModules['蝶六时'],
    },
    潘朵索: {
        beforeBattle: async () => {
            await Functions.lowerBlood([1656383521, 1656056275]);
        },
        cts: [1656383521, 1656056275, 1656847261],
        strategy: moveModules['潘朵索'],
    },
    潘朵必先: {
        beforeBattle: async () => {
            await Functions.lowerBlood([1656383521, 1656056275, 1655917820, 1655445699, 1655484346]);
        },
        cts: [1656383521, 1656056275, 1655917820, 1655445699, 1655484346],
        strategy: moveModules['潘朵必先'],
    },
    圣谱单挑: { beforeBattle: async () => {}, cts: [1656092908], strategy: moveModules['圣谱单挑'] },
    克朵补刀: {
        beforeBattle: async () => {
            await Functions.lowerBlood([1656383521, 1655445699, 1655484346, 1656945596]);
        },
        cts: [1656383521, 1656056275, 1655445699, 1655484346, 1656945596],
        strategy: moveModules['克朵补刀'],
    },
};

const options: PetFactor.Option[] = [
    // 杰洛特
    {
        difficulty: PetFactor.LevelDifficulty.Hell,
        sweep: true,
        id: 38,
        strategy: [],
    },
    // 东辉
    {
        difficulty: PetFactor.LevelDifficulty.Hard,
        sweep: true,
        id: 65,
        strategy: [],
    },
    // 眠神
    {
        difficulty: PetFactor.LevelDifficulty.Ease,
        sweep: false,
        id: 73,
        strategy: [
            perStrategy['克朵六时'],
            perStrategy['克朵六时'],
            perStrategy['圣谱单挑'],
            perStrategy['克朵六时'],
            perStrategy['潘朵必先'],
        ],
    },
    //未名2
    {
        difficulty: PetFactor.LevelDifficulty.Ease,
        sweep: false,
        id: 54,
        strategy: [
            perStrategy['克朵六时'],
            perStrategy['克朵六时'],
            perStrategy['圣谱单挑'],
            perStrategy['克朵补刀'],
            perStrategy['克朵六时'],
        ],
    },
];

class applyBm extends ReflectObjBase implements ModClass {
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
        return new PetFactor.Runner();
    }
    async runAll() {
        const runners: PetFactor.Runner[] = [];

        for (let option of options) {
            runners.push(new PetFactor.Runner());
            runners.at(-1)?.init(option);
            await runners.at(-1)?.update();
        }
        for (let runner of runners) {
            while (runner.isChallenge || runner.leftChallengeTimes > 0) {
                if (runner.option.sweep) {
                    await runner.sweep();
                } else {
                    await runner.prepare();
                    await Battle.Manager.runOnce(runner.battleOnce.bind(runner));
                }
                await runner.update();
                Battle.Manager.clear();
            }
        }
    }

    meta = { description: '' };
}

export default {
    mod: applyBm,
};
