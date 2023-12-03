import type { MoveStrategy } from '../battle/index.js';

export const LevelAction = {
    BATTLE: 'battle' as const,
    AWARD: 'award' as const,
    STOP: 'stop' as const,
};

export interface LevelData {
    leftTimes: number;
    success: boolean;
    state: string;
}

/** 关卡配置 */
export interface ILevelRunner<TData extends LevelData = LevelData> {
    /** 关卡的动态数据 */
    data: TData;
    
    /** 玩家可选的关卡的配置数据 */
    option: object;

    actions: Record<string, (this: ILevelRunner<TData>) => Promise<void>>;

    logger: typeof console.log;
    updater(): Promise<string>;
    selectBattle(): ILevelBattle;

    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
}

export interface ILevelBattle {
    /** 战斗模型 */
    strategy: MoveStrategy;
    /** 精灵列表 */
    pets: number[];
    /** 战斗前准备 */
    beforeBattle?: () => Promise<void>;
}
