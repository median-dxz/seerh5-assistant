import { z } from 'zod';

const ConfigItemSchema = z
    .object({ name: z.string(), helperText: z.string().optional() })
    .and(
        z.union([
            z.object({ type: z.literal('input'), default: z.string() }),
            z.object({ type: z.literal('select'), default: z.string(), list: z.record(z.string()) }),
            z.object({ type: z.literal('checkbox'), default: z.boolean() }),
            z.object({ type: z.literal('battle'), default: z.string() })
        ])
    );

const DateObjectSchema = z.custom<object>(
    (data) =>
        data !== null &&
        typeof data === 'object' &&
        (Object.getPrototypeOf(data) === Object.prototype ||
            Array.isArray(data) ||
            data instanceof Set ||
            data instanceof Map)
);

export const ModMetadataSchema = z.object({
    id: z.string(),
    scope: z.string().optional(),
    version: z.string().optional(),
    description: z.string().optional(),
    preload: z.boolean().optional(),
    data: DateObjectSchema.optional(),
    configSchema: z.record(ConfigItemSchema).optional()
});
