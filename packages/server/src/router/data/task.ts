import { z } from 'zod';
import { DateObjectSchema } from '../../shared/schemas.ts';
import { procedure, router } from '../trpc.ts';

export const task = router({
    all: procedure.query(({ ctx }) => {
        const { taskConfig } = ctx;
        return taskConfig.query();
    }),
    remove: procedure.input(z.string()).mutation(({ input, ctx }) => {
        const taskId = input;
        const { taskConfig } = ctx;
        return taskConfig.remove(taskId);
    }),
    options: procedure.input(z.string()).query(({ input, ctx }) => {
        const taskId = input;
        const { taskConfig } = ctx;
        return taskConfig.options(taskId);
    }),
    set: procedure.input(z.object({ id: z.string(), data: DateObjectSchema })).mutation(({ input, ctx }) => {
        const { id, data } = input;
        const { taskConfig } = ctx;
        return taskConfig.set(id, data);
    })
});
