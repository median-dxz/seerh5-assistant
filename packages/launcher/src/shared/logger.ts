import type { AnyFunction } from '@sea/core';
import chalk from 'chalk';

chalk.level = 3;

export const LogStyle = {
    mod: chalk.hex('#fc9667'),
    core: chalk.hex('#e067fc')
} as const;

export const CommonLogger = (
    module: string,
    level: 'debug' | 'info' | 'warn' | 'error' | 'fault',
    style = LogStyle.core
) => {
    switch (level) {
        case 'debug':
        case 'info':
            return console.log.bind(console, style('[%s][%s]:'), module, level);
        case 'warn':
            return console.warn.bind(console, style('[%s][%s]:'), module, level);
        case 'error':
        case 'fault':
            return console.error.bind(console, style('[%s][%s]:'), module, level);
    }
};

const BattleLogger = { info: CommonLogger('BattleManager', 'info') };
const AwardLogger = { info: CommonLogger('AwardManager', 'info') };
const ModuleLogger = { info: CommonLogger('ModuleManger', 'info') };

export { AwardLogger, BattleLogger, ModuleLogger };

export class CommonLoggerBuilder {
    private callbacks: Array<(msg: string) => void>;
    logger: AnyFunction;
    constructor(id: string) {
        this.callbacks = [];
        this.logger = new Proxy(CommonLogger(id, 'info', LogStyle.mod), {
            apply: (target, thisArg, args) => {
                this.callbacks.forEach((handler) => {
                    handler(args[0] as string);
                });
                Reflect.apply(target, thisArg, args);
            }
        });
    }
    trace(handler: (msg: string) => void) {
        this.callbacks.push(handler);
    }
}
