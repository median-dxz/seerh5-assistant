export type { Trigger } from './manager.js';
export type { RoundData } from './provider.js';
export type { MoveHandler, MoveStrategy, SwitchNoBloodHandler } from './strategy.js';

import { manager } from './manager.js';
import { operator } from './operator.js';
import { provider } from './provider.js';

export * as Strategy from './strategy.js';

export const SEABattle = {
    operator,
    provider,
    manager,
};
