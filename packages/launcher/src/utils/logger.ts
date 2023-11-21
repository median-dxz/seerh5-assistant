import chalk from 'chalk';
import { NOOP } from 'sea-core';

chalk.level = 3;

// export const defaultStyle = {
//     mod: chalk.hex('#fc9667'),
//     core: chalk.hex('#e067fc'),
//     none: chalk.bgHex('#eff1f3'),
// } as const;

export const SEAModuleLogger = (module: string, level: 'debug' | 'info', cond?: boolean | null): typeof console.log => {
    if (cond) {
        return NOOP;
    }
    const style = chalk.hex('#e067fc');
    return console.log.bind(console, style('[%s][%s]:'), module, level);
};
