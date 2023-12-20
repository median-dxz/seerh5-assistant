export interface Logger {
    debug: typeof console.info;
    warn: typeof console.warn;
}

export enum ModuleName {
    Battle = 'battle',
    Utils = 'utils',
}

let isDev = false;

let coreLogger: Logger = {
    debug: console.info,
    warn: console.warn,
};

export const setDev = (dev: boolean) => {
    isDev = dev;
};

export const setLogger = (logger: Logger) => {
    coreLogger = logger;
};

export const getModuleLogger = (module: ModuleName): Logger => ({
    debug: (...args: Parameters<Logger['warn']>) => {
        if (isDev) {
            coreLogger.debug('[sea-core][%s]:', module, ...args);
        }
    },
    warn: (...args: Parameters<Logger['warn']>) => {
        coreLogger.warn('[sea-core][%s]:', module, ...args);
    },
});
