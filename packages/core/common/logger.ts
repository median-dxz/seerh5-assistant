import { Subject } from 'rxjs';

export type Serializable =
    | string
    | number
    | boolean
    | null
    | undefined
    | Serializable[]
    | { [key: string]: Serializable };

export interface SEACLogEvent {
    module: string;
    stack?: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    data: Serializable[];
}

export const logEvent$ = new Subject<SEACLogEvent>();

export const getLogger = (module: string) => ({
    debug: (...data: Serializable[]) => {
        logEvent$.next({ module, level: 'debug', data });
    },
    info: (...data: Serializable[]) => {
        logEvent$.next({ module, level: 'info', data });
    },
    warn: (...data: Serializable[]) => {
        logEvent$.next({ module, level: 'warn', data });
    },
    error: (...data: Serializable[]) => {
        logEvent$.next({ module, level: 'error', data, stack: Error().stack });
    }
});
