import { z } from 'zod';
import { DateObjectSchema } from '../../shared/utils.ts';
import { procedure, router } from '../trpc.ts';

export const taskOptions = router({
    all: procedure.input(z.object({ uid: z.string() })).query(({ input: { uid }, ctx }) => {
        const { taskOptions } = ctx;
        return taskOptions.query(uid);
    }),
    set: procedure
        .input(z.object({ uid: z.string(), taskId: z.string(), data: DateObjectSchema }))
        .mutation(({ input: { uid, taskId, data }, ctx }) => {
            const { taskOptions } = ctx;
            return taskOptions.set(uid, taskId, data);
        })
});
