import { PetFragmentLevelDifficulty as Difficulty } from '../constant/index.js';
import { EntityBase, type EntityType } from './EntityBase.js';

export interface IPFLevelBoss {
    battleBoss: number;
    description: string;
    id: number;
}

export class PetFragmentLevel extends EntityBase {
    readonly __type: EntityType = 'PetFragmentLevel';
    readonly id: number;
    readonly name: string;

    readonly petFragment: {
        petId: number;
        itemId: number;
        itemName: string;
        petConsume: number;
        effectId: number;
        effectConsume: number;
        fifthSkillId: number;
        fifthSkillConsume: number;
    };

    /** 今日总次数 */
    totalTimes: number;

    /** 查询用键值 */
    values: {
        /** 今日已开启关卡次数 */
        openTimes: number;
        /** 当前失败次数 */
        failTimes: number;
        /** 扫荡可用性 */
        gain: number;
        /** 进度参数查询 */
        progress: number;
    };

    bosses: {
        [Difficulty.Ease]: IPFLevelBoss[];
        [Difficulty.Normal]: IPFLevelBoss[];
        [Difficulty.Hard]: IPFLevelBoss[];
    };

    pieces: {
        [Difficulty.Ease]: number;
        [Difficulty.Normal]: number;
        [Difficulty.Hard]: number;
    };

    constructor(obj: seerh5.PetFragmentLevelObj) {
        super();
        const { Configure, EasyBattle, HardBattle, NormalBattle, Reward } = obj;
        [this.id, this.name] = [obj.ID, obj.Desc];

        const pfObj = PetFragmentXMLInfo.getItemByID(Reward.ItemID);

        this.petFragment = {
            petId: pfObj.MonsterID,
            itemId: pfObj.ID,
            itemName: pfObj.Name,
            petConsume: pfObj.PetConsume,
            effectId: pfObj.NewSeIdx,
            effectConsume: pfObj.NewseConsume,
            fifthSkillId: pfObj.MoveID,
            fifthSkillConsume: pfObj.MovesConsume
        };

        this.totalTimes = obj.Configure.Times;
        this.values = {
            openTimes: Configure.TimeValue,
            failTimes: Configure.FailTimes,
            progress: Configure.ProgressValue,
            gain: Reward.GainValue
        };
        this.bosses = {
            [Difficulty.Ease]: EasyBattle.Task.map((o) => ({
                id: o.ID,
                battleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID
            })),
            [Difficulty.Normal]: NormalBattle.Task.map((o) => ({
                id: o.ID,
                battleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID
            })),
            [Difficulty.Hard]: HardBattle.Task.map((o) => ({
                id: o.ID,
                battleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID
            }))
        };
        this.pieces = {
            [Difficulty.Ease]: EasyBattle.Out,
            [Difficulty.Normal]: NormalBattle.Out,
            [Difficulty.Hard]: HardBattle.Out
        };
    }
}
