import type { PetFragmentLevelDifficulty } from '../constant/index.js';
import { EntityBase, type EntityType } from './EntityBase.js';

export interface IPFLevelBoss {
    BattleBoss: number;
    pet: number;
    description: string;
    id: number;
}

export interface IPetFragmentLevelObject {
    petFragmentItem: number;
    level: { ease: IPFLevelBoss[]; normal: IPFLevelBoss[]; hard: IPFLevelBoss[] };
    /** 今日总次数 */
    totalTimes: number;

    /** 查询用键值 */
    values: {
        /** 今日已开启关卡次数 */
        openTimes: number;
        /** 当前失败次数 */
        failTimes: number;
        /** 进度参数查询 */
        progress: number;
    };

    // pieces: {
    //     ease: number;
    //     normal: number;
    //     hard: number;
    // };
}

export class PetFragmentLevel extends EntityBase implements IPetFragmentLevelObject {
    declare readonly __type: EntityType;

    totalTimes: number;
    petFragmentItem: number;

    values: {
        openTimes: number;
        failTimes: number;
        progress: number;
    };
    level: { ease: IPFLevelBoss[]; normal: IPFLevelBoss[]; hard: IPFLevelBoss[] };

    // TODO: 还未实现查询关卡获取的因子数量
    pieces?: {
        ease: number;
        normal: number;
        hard: number;
    };

    isChallenge?: boolean;
    curDifficulty?: PetFragmentLevelDifficulty;
    leftChallengeTimes?: number;
    failedTimes?: number;
    curPosition?: number;

    constructor(obj: seerh5.PetFragmentLevelObj) {
        super();
        this.__type = 'PetFragmentLevel';

        const { Configure, EasyBattle, HardBattle, NormalBattle } = obj;
        [this.id, this.name, this.petFragmentItem] = [obj.ID, obj.Desc, obj.Reward.ItemID];
        this.totalTimes = obj.Configure.Times;
        this.values = {
            openTimes: Configure.TimeValue,
            failTimes: Configure.FailTimes,
            progress: Configure.ProgressValue,
        };
        this.level = {
            ease: EasyBattle.Task.map((o) => ({
                id: o.ID,
                BattleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID,
            })),
            normal: NormalBattle.Task.map((o) => ({
                id: o.ID,
                BattleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID,
            })),
            hard: HardBattle.Task.map((o) => ({
                id: o.ID,
                BattleBoss: o.BattleBoss,
                description: o.Desc,
                pet: o.BossID,
            })),
        };
    }
}
