import { z } from 'zod';
import { modList } from '../../data/ModList.ts';
import { procedure, router } from '../trpc.ts';
import { ModManager } from './manager.ts';

const modIdentifierSchema = z.object({
    scope: z.string(),
    id: z.string()
});

export const modRouter = router({
    modList: procedure.query(() => {
        return modList.getModList();
    }),
    config: procedure.input(modIdentifierSchema).query(({ input }) => {
        const { id, scope } = input;
        return ModManager.config(scope, id);
    }),
    setConfig: procedure.input(modIdentifierSchema.and(z.object({ data: z.unknown() }))).mutation(({ input }) => {
        const { id, scope, data } = input;
        return ModManager.saveConfig(scope, id, data);
    }),
    customData: procedure.input(modIdentifierSchema).query(({ input }) => {
        const { id, scope } = input;
        return ModManager.customData(scope, id);
    }),
    saveCustomData: procedure.input(modIdentifierSchema.and(z.object({ data: z.unknown() }))).mutation(({ input }) => {
        const { id, scope, data } = input;
        return ModManager.saveCustomData(scope, id, data);
    }),
    install: procedure.mutation(() => {
        return ModManager.install();
    }),
    uninstall: procedure.mutation(() => {
        return ModManager.uninstall();
    }),
    toggleDisable: procedure.mutation(({ ctx }) => {
        return {
            success: true
        };
    })
});
