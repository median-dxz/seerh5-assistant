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

export interface SALevelInfo {
    name: string;
    maxTimes: number;
}

// 关卡配置
export interface ILevelRunner<TData extends SALevelData = SALevelData, TInfo extends SALevelInfo = SALevelInfo> {
    // 关卡的动态数据
    data: TData;
    // 关卡的静态数据
    info: TInfo;
    // 玩家可选的关卡的配置数据
    option: object;

    actions: Record<string, (this: ILevelRunner<TData, TInfo>) => Promise<void>>;

    logger: typeof console.log;
    updater(): Promise<SALevelState>;
    selectBattle(): ILevelBattleStrategy;

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
