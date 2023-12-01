import chalk from 'chalk';

chalk.level = 3;

// export const defaultStyle = {
//     mod: chalk.hex('#fc9667'),
//     core: chalk.hex('#e067fc'),
//     none: chalk.bgHex('#eff1f3'),
// } as const;

const ModuleLogger = (module: string, level: 'debug' | 'info' | 'warn' | 'error' | 'fault'): typeof console.log => {
    const style = chalk.hex('#e067fc');
    return console.log.bind(console, style('[%s][%s]:'), module, level);
};

const BattleManager = { info: ModuleLogger('BattleManager', 'info') };
const AwardManager = { info: ModuleLogger('AwardManager', 'info') };
const ModuleManger = { info: ModuleLogger('ModuleManger', 'info') };

export { AwardManager, BattleManager, ModuleManger };

