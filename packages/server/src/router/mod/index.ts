import { z } from 'zod';
import { modIndexes } from '../../data/ModIndexes.ts';
import { procedure, router } from '../trpc.ts';
import { ModManager } from './manager.ts';
import { ModIdentifierSchema, ModInstallOptionsSchema, NonNullObjectSchema } from './schemas.ts';

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
