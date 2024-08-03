import { z } from 'zod';

export interface IStorage {
    source: string;
    load(defaultData?: object): Promise<object>;
    save(data: object): Promise<void>;
    delete(): Promise<void>;
}

export interface IModFileHandler {
    root: string;
    buildPath(filename: string): string;
    remove(cid: string): void | Promise<void>;
}

export const DateObjectSchema = z.custom<object>(
    (data) =>
        data !== null &&
        typeof data === 'object' &&
        (Object.getPrototypeOf(data) === Object.prototype ||
            Array.isArray(data) ||
            data instanceof Set ||
            data instanceof Map)
);
