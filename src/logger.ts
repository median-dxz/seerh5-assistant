import chalk, { ChalkInstance } from 'chalk';
export const defaultStyle = {
    mod: chalk.hex('#fc9667'),
    core: chalk.hex('#e067fc'),
    none: chalk.bgHex('#eff1f3'),
} as const;

export const SaModuleLogger = (module: string, fontStyle: ChalkInstance = defaultStyle.none): typeof console.log => {
    return console.log.bind(console, fontStyle('[%s]:'), module);
};
