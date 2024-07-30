import { z } from 'zod';

import { getCompositeId } from '../../shared/index.ts';
import { DateObjectSchema } from '../../shared/schemas.ts';

import { procedure, router } from '../trpc.ts';
import { InstallModOptionsSchema } from './schemas.ts';

export const modRouter = router({
    modList: procedure.query(({ ctx }) => {
        const { modManager } = ctx;
        return modManager.index.stateList();
    }),

    config: procedure.input(z.string()).query(({ input, ctx }) => {
        const cid = input;
        const { modManager } = ctx;
        return modManager.config(cid);
    }),

    setConfig: procedure
        .input(z.object({ compositeId: z.string(), data: DateObjectSchema }))
        .mutation(({ input, ctx }) => {
            const { data, compositeId } = input;
            const { modManager } = ctx;
            return modManager.saveConfig(compositeId, data);
        }),

    data: procedure.input(z.string()).query(({ input, ctx }) => {
        const cid = input;
        const { modManager } = ctx;
        return modManager.data(cid);
    }),

    saveData: procedure
        .input(z.object({ compositeId: z.string(), data: DateObjectSchema }))
        .mutation(({ input, ctx }) => {
            const { compositeId, data } = input;
            const { modManager } = ctx;
            return modManager.saveData(compositeId, data);
        }),

    install: procedure
        .input(z.object({ scope: z.string(), id: z.string(), options: InstallModOptionsSchema }))
        .mutation(({ input, ctx }) => {
            const { scope, id, options } = input;
            const { modManager } = ctx;
            // ATTENTION: this endpoint is for builtin mods ONLY
            return modManager.install(getCompositeId(scope, id), options);
        }),

    setEnable: procedure
        .input(z.object({ compositeId: z.string(), enable: z.boolean() }))
        .mutation(({ input, ctx }) => {
            const { compositeId, enable } = input;
            const { modManager } = ctx;
            return modManager.setEnable(compositeId, enable);
        }),

    uninstall: procedure.input(z.string()).mutation(({ input, ctx }) => {
        const cid = input;
        const { modManager } = ctx;
        return modManager.uninstall(cid);
    })
});
