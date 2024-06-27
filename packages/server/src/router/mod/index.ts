import type { DataObject } from '@sea/mod-type';
import { z } from 'zod';
import { modIndexes } from '../../data/ModIndexes.ts';
import { procedure, router } from '../trpc.ts';
import { ModManager } from './manager.ts';

const ModIdentifierSchema = z.object({
    scope: z.string(),
    id: z.string()
});

const NonNullObjectSchema = z.custom<DataObject>((data) => data !== null && typeof data === 'object');

const ModInstallOptionsSchema = z.object({
    builtin: z.boolean().optional(),
    preload: z.boolean().optional(),
    update: z.boolean().optional(),
    config: NonNullObjectSchema.optional(),
    data: NonNullObjectSchema.optional()
});

export const modRouter = router({
    modList: procedure.query(() => modIndexes.getModList()),
    config: procedure.input(ModIdentifierSchema).query(({ input }) => {
        const { id, scope } = input;
        return ModManager.config(scope, id);
    }),
    setConfig: procedure
        .input(ModIdentifierSchema.and(z.object({ data: NonNullObjectSchema })))
        .mutation(({ input }) => {
            const { id, scope, data } = input;
            return ModManager.saveConfig(scope, id, data);
        }),
    data: procedure.input(ModIdentifierSchema).query(({ input }) => {
        const { id, scope } = input;
        return ModManager.data(scope, id);
    }),
    saveData: procedure
        .input(ModIdentifierSchema.and(z.object({ data: NonNullObjectSchema })))
        .mutation(({ input }) => {
            const { id, scope, data } = input;
            return ModManager.saveData(scope, id, data);
        }),
    install: procedure
        .input(ModIdentifierSchema.and(z.object({ options: ModInstallOptionsSchema })))
        .mutation(({ input }) => {
            const { id, scope, options } = input;
            return ModManager.install(scope, id, options);
        }),

    uninstall: procedure.mutation(() => ModManager.uninstall()),
    toggleDisable: procedure.mutation(() => ({
        success: true
    }))
});
