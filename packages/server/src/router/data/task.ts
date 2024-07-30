import { z } from 'zod';
import { DateObjectSchema } from '../../shared/schemas.ts';
import { procedure, router } from '../trpc.ts';

export const task = router({
    all: procedure.query(({ ctx }) => {
        const { taskConfig } = ctx;
        return taskConfig.query();
    }),
    set: procedure.input(z.object({ id: z.string(), data: DateObjectSchema })).mutation(({ input, ctx }) => {
        const { id, data } = input;
        const { taskConfig } = ctx;
        return taskConfig.set(id, data);
    })
});
