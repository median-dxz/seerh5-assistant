import type { MoveStrategy } from '../battle/index.js';

export const LevelState = {
    BATTLE: 'battle',
    AWARD: 'award',
    DO_ACTION: 'do_action',
    STOP: 'stop',
};

export interface LevelData {
    leftTimes: number;
    success: boolean;
    state: string;
}

export interface LevelMeta {
    name: string;
    maxTimes: number;
}

// 关卡配置
export interface ILevelRunner<TData extends LevelData = LevelData, TMeta extends LevelMeta = LevelMeta> {
    // 关卡的动态数据
    data: TData;
    // 关卡的静态数据
    meta: TMeta;
    // 玩家可选的关卡的配置数据
    option: object;

    actions: Record<string, (this: ILevelRunner<TData, TMeta>) => Promise<void>>;

    logger: typeof console.log;
    updater(): Promise<string>;
    selectBattle(): ILevelBattle;

    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
}

export interface ILevelBattle {
    // 战斗模型
    strategy: MoveStrategy;
    // 精灵列表
    pets: number[];
    // 战斗前准备
    beforeBattle?: () => Promise<void>;
}
