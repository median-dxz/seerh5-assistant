export type { LevelBattle, LevelRunner } from './level/types.js';
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
    manager
};

export { LevelAction, levelManager } from './level/index.js';
