import type { AnyFunction } from '../common/utils.js';
import * as Engine from './engine.js';

export * from './GameConfig.js';
export * as Socket from './socket.js';

function extendsEngine(func: AnyFunction | Record<string, AnyFunction>) {
    if (typeof func === 'function') {
        (Engine as unknown as { [method: string]: AnyFunction })[func.name] = func;
    } else {
        Object.assign(Engine, func);
    }
}

export { Engine, extendsEngine };
