import type { MoveStrategy } from '../strategy.js';

export interface LevelData {
    remainingTimes: number;
    progress: number;
}

/** 关卡状态机, 由LevelManager来运行 */
export interface ILevelRunner<TData extends LevelData = LevelData> {
    /** 关卡的动态数据 */
    data: TData;

    /** 玩家可选的关卡的配置数据 */
    readonly option: object;

    actions: Record<string, (this: ILevelRunner<TData>) => Promise<void>>;

    update(): Promise<string>;
    selectLevelBattle(): ILevelBattle;

    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;

    logger: typeof console.log;
}

export interface ILevelBattle {
    /** 战斗模型 */
    strategy: MoveStrategy;
    /** 精灵列表 */
    pets: number[];
    /** 战斗前准备 */
    beforeBattle?: () => Promise<void>;
}
