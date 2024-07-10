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
): typeof console.log => {
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
const SEAModLogger = { info: CommonLogger('模组管理器', 'info'), error: CommonLogger('模组管理器', 'error') };

export { AwardLogger, BattleLogger, ModuleLogger, SEAModLogger };

export const LauncherLoggerBuilder = {
    build: (id: string) => CommonLogger(id, 'info', LogStyle.mod)
};
