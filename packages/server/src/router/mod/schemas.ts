import { z } from 'zod';

export const ModIdentifierSchema = z.object({
    scope: z.string(),
    id: z.string()
});

export const NonNullObjectSchema = z.custom<DataObject>((data) => data !== null && typeof data === 'object');

export const ModInstallOptionsSchema = z.object({
    builtin: z.boolean().optional(),
    preload: z.boolean().optional(),
    update: z.boolean().optional(),
    config: NonNullObjectSchema.optional(),
    data: NonNullObjectSchema.optional()
});

export type DataObject = object & {};

export interface ModInstallOptions {
    builtin?: boolean;
    preload?: boolean;
    update?: boolean;
    config?: DataObject;
    data?: DataObject;
}
