export type { ILevelBattle, ILevelRunner, LevelData } from './level/type.js';
export type { Trigger } from './manager.js';
export type { RoundData } from './provider.js';
export type { Matcher, MoveHandler, MoveStrategy } from './strategy.js';

import { executor } from './executor.js';
import { manager } from './manager.js';
import { provider } from './provider.js';

export * as strategy from './strategy.js';

export const battle = {
    executor,
    provider,
    manager,
};

export { LevelAction } from './level/action.js';
export { LevelManager } from './level/index.js';
