import { z } from 'zod';
import { DateObjectSchema, type DataObject } from '../../shared/schemas.ts';

export const ModIdentifierSchema = z.object({
    scope: z.string(),
    id: z.string()
});

export const ModInstallOptionsSchema = z.object({
    builtin: z.boolean().optional(),
    preload: z.boolean().optional(),
    update: z.boolean().optional(),
    config: DateObjectSchema.optional(),
    data: DateObjectSchema.optional()
});

export interface ModInstallOptions {
    builtin?: boolean;
    preload?: boolean;
    update?: boolean;
    config?: DataObject;
    data?: DataObject;
}
