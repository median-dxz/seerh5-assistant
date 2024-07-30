import { z } from 'zod';
import { DateObjectSchema } from '../../shared/schemas.ts';

export const InstallModOptionsSchema = z.object({
    version: z.string(),
    builtin: z.boolean().optional(),
    preload: z.boolean().optional(),
    update: z.boolean().optional(),
    config: DateObjectSchema.optional(),
    data: DateObjectSchema.optional()
});

export type InstallModOptions = z.infer<typeof InstallModOptionsSchema>;
