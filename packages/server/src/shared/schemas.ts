import { z } from 'zod';

export type DataObject = object & {};
export const DateObjectSchema = z.custom<DataObject>(
    (data) =>
        data !== null &&
        typeof data === 'object' &&
        (Object.getPrototypeOf(data) === Object.prototype ||
            Array.isArray(data) ||
            data instanceof Set ||
            data instanceof Map)
);
