import { Subject } from 'rxjs';

export interface CoreLogEvent {
    module: ModuleName;
    stack?: string;
    time: number;
    level: 'debug' | 'info' | 'warn' | 'error';
    msg?: string;
}

export enum ModuleName {
    Battle = 'battle',
    Utils = 'utils',
}

let isDev = false;
export const setDevMode = (dev: boolean) => {
    isDev = dev;
};

export const event$ = new Subject<CoreLogEvent>();

export const getModuleLogger = (module: ModuleName) => ({
    debug: (msg?: string) => {
        if (isDev) {
            event$.next({ module, level: 'debug', time: Date.now(), msg });
        }
    },
    info: (msg?: string) => {
        event$.next({ module, level: 'info', time: Date.now(), msg });
    },
    warn: (msg?: string) => {
        event$.next({ module, level: 'warn', time: Date.now(), msg });
    },
    error: (msg?: string) => {
        event$.next({ module, level: 'error', time: Date.now(), msg, stack: Error().stack });
    },
});
