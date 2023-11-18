export type { Trigger } from './manager.js';
import { clear, resolveStrategy, takeover } from './manager.js';
export const Manager = {
    clear,
    resolveStrategy,
    takeover,
};

export * from './operator.js';
export * from './provider.js';
export * from './strategy.js';

