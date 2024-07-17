import { z } from 'zod';

import { modIndexes } from '../../data/ModIndexes.ts';
import { getCompositeId } from '../../shared/index.ts';
import { DateObjectSchema } from '../../shared/schemas.ts';

import { procedure, router } from '../trpc.ts';
import { ModManager } from './manager.ts';
import { InstallModOptionsSchema } from './schemas.ts';

export const modRouter = router({
    modList: procedure.query(modIndexes.stateList.bind(modIndexes)),

    config: procedure.input(z.string()).query(({ input }) => {
        const compositeId = input;
        return ModManager.config(compositeId);
    }),

    setConfig: procedure.input(z.object({ compositeId: z.string(), data: DateObjectSchema })).mutation(({ input }) => {
        const { data, compositeId } = input;
        return ModManager.saveConfig(compositeId, data);
    }),

    data: procedure.input(z.string()).query(({ input }) => {
        const compositeId = input;
        return ModManager.data(compositeId);
    }),

    saveData: procedure.input(z.object({ compositeId: z.string(), data: DateObjectSchema })).mutation(({ input }) => {
        const { compositeId, data } = input;
        return ModManager.saveData(compositeId, data);
    }),

    install: procedure
        .input(z.object({ scope: z.string(), id: z.string(), options: InstallModOptionsSchema }))
        .mutation(({ input }) => {
            const { scope, id, options } = input;
            // ATTENTION: this endpoint is for builtin mods ONLY
            return ModManager.install(getCompositeId(scope, id), options);
        }),

    setEnable: procedure.input(z.object({ compositeId: z.string(), enable: z.boolean() })).mutation(({ input }) => {
        const { compositeId, enable } = input;
        return ModManager.setEnable(compositeId, enable);
    }),

    uninstall: procedure.mutation(() => ModManager.uninstall())
});
