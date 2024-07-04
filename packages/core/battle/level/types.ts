import type { AnyFunction } from '../../common/utils.js';
import type { MoveStrategy } from '../strategy.js';

/** 关卡状态机, 由LevelManager来运行 */
export interface LevelRunner {
    /** 更新关卡动态数据 */
    update(): Promise<void>;

    /** 获取下一个动作 */
    next(): string;

    /** 选择对战模型 */
    selectLevelBattle?(): LevelBattle;

    logger: AnyFunction;

    /** 关卡能做出的动作 */
    actions: Record<string, (() => Promise<void> | void) | undefined> & ThisType<LevelRunner>;
}

/** 对战模型 */
export interface LevelBattle {
    /** 行动策略 */
    strategy: MoveStrategy;
    /** 精灵列表 */
    pets: number[];
    /** 战斗前准备 */
    beforeBattle?: () => Promise<void>;
}
