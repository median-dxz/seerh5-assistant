import type { MoveStrategy } from '../battle/index.js';

// 关卡配置接口
export interface ILevelRunner<TConfig extends object, TAction extends Record<string, () => Promise<void>>> {
    // 剩余次数
    leftCount: number;
    // 最大次数
    readonly maxCount: number;
    // 正在运行
    running: boolean;
    // 信息更新器
    updater(): Promise<TConfig>;
    // 操作
    actionReducer(type: keyof TAction): Promise<void>;

    beforeAll(): Promise<void>;
    afterAll(): Promise<void>;

    // 进入战斗
    enterBattle: (config: TConfig) => void;
    // 选择战斗模型
    selectMove: (config: TConfig) => ILevelBattleStrategy;
}

export interface ILevelBattleStrategy {
    // 战斗模型
    moveModule: MoveStrategy;
    // 精灵列表
    pets: number[];
    // 战斗前准备
    beforeBattle: () => Promise<void>;
}
