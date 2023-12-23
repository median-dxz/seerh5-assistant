import { Subject } from 'rxjs';

export interface CoreLogEvent {
    module: string;
    stack?: string;
    time: number;
    level: 'debug' | 'info' | 'warn' | 'error';
    msg?: string;
}

export const event$ = new Subject<CoreLogEvent>();

export const getLogger = (module: string) => ({
    debug: (msg?: string) => {
        event$.next({ module, level: 'debug', time: Date.now(), msg });
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
