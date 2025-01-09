import { z } from 'zod';

import { getCompositeId, praseCompositeId } from '@sea/mod-resolver';

import { DateObjectSchema } from '../../shared/utils.ts';

import { procedure, router } from '../trpc.ts';
import { InstallModOptionsSchema } from './schemas.ts';

export const modRouter = router({
    indexList: procedure.query(({ ctx }) => {
        const { modManager } = ctx;
        return modManager.index.stateList();
    }),

    config: procedure
        .input(z.object({ uid: z.string(), compositeId: z.string() }))
        .query(({ input: { uid, compositeId }, ctx }) => {
            const { modManager } = ctx;
            return modManager.config(uid, compositeId);
        }),

    setConfig: procedure
        .input(z.object({ uid: z.string(), compositeId: z.string(), data: DateObjectSchema }))
        .mutation(({ input: { uid, compositeId, data }, ctx }) => {
            const { modManager } = ctx;
            return modManager.saveConfig(uid, compositeId, data);
        }),

    data: procedure
        .input(z.object({ uid: z.string(), compositeId: z.string() }))
        .query(({ input: { uid, compositeId }, ctx }) => {
            const { modManager } = ctx;
            return modManager.data(uid, compositeId);
        }),

    setData: procedure
        .input(z.object({ uid: z.string(), compositeId: z.string(), data: DateObjectSchema }))
        .mutation(({ input: { uid, compositeId, data }, ctx }) => {
            const { modManager } = ctx;
            return modManager.saveData(uid, compositeId, data);
        }),

    install: procedure
        .input(z.object({ scope: z.string(), id: z.string(), options: InstallModOptionsSchema }))
        .mutation(({ input, ctx }) => {
            const { scope, id, options } = input;
            const { modManager } = ctx;
            // ATTENTION: this endpoint is for builtin mods ONLY
            return modManager.install(getCompositeId({ scope, id }), options);
        }),

    setEnable: procedure
        .input(z.object({ compositeId: z.string(), enable: z.boolean() }))
        .mutation(({ input, ctx }) => {
            const { compositeId, enable } = input;
            const { modManager } = ctx;
            return modManager.setEnable(compositeId, enable);
        }),

    uninstall: procedure.input(z.string()).mutation(async ({ input, ctx }) => {
        const cid = input;
        const { modManager, taskOptions, modFileHandler } = ctx;

        // 删除任务配置
        Object.entries(taskOptions.queryAll()).forEach(async ([uid, configs]) => {
            for (const [taskId] of configs) {
                const { scope } = praseCompositeId(taskId);
                if (scope === cid) {
                    await taskOptions.remove(uid, taskId);
                }
            }
        });

        // 删除Mod文件
        await modFileHandler.remove(cid);

        return modManager.uninstall(cid);
    })
});
