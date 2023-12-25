import type { AnyFunction } from 'index.js';
import type { MoveStrategy } from '../strategy.js';

/** 关卡状态机, 由LevelManager来运行 */
export interface ILevelRunner<TData extends object = object> {
    /** 关卡的动态数据 */
    data: TData;

    /** 关卡能做出的动作 */
    actions: Record<string, (this: ILevelRunner<TData>) => Promise<void>>;

    /** 更新关卡动态数据 */
    update(): Promise<void>;

    /** 获取下一个动作 */
    next(): string;

    /** 选择对战模型 */
    selectLevelBattle?(): ILevelBattle;

    logger: AnyFunction;
}

/** 对战模型 */
export interface ILevelBattle {
    /** 行动策略 */
    strategy: MoveStrategy;
    /** 精灵列表 */
    pets: number[];
    /** 战斗前准备 */
    beforeBattle?: () => Promise<void>;
}
