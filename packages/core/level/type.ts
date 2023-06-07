import type { MoveStrategy } from '../battle/index.js';

export enum SALevelState {
    BATTLE = 'battle',
    AWARD = 'award',
    DO_ACTION = 'do_action',
    STOP = 'stop',
}

export type SALevelAction = Record<SALevelState, () => Promise<void>>;

export interface SALevelData {
    leftTimes: number;
    success: boolean;
    state: SALevelState;
}

export interface SALevelConfig {
    name: string;
    maxTimes: number;
}

// 关卡配置
export interface ILevelRunner<TData extends SALevelData = SALevelData, TConfig extends SALevelConfig = SALevelConfig> {
    data: TData;
    config: TConfig;
    option: object;

    actions: Record<string, (this: ILevelRunner<TData, TConfig>) => Promise<void>>;

    logger: (msg: string) => void;
    updater(): Promise<SALevelState>;
    selectStrategy(): ILevelBattleStrategy;

    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
}

export interface ILevelBattleStrategy {
    // 战斗模型
    strategy: MoveStrategy;
    // 精灵列表
    pets: number[];
    // 战斗前准备
    beforeBattle?: () => Promise<void>;
}
