import { z } from 'zod';
import { DateObjectSchema } from '../../shared/schemas.ts';
import { procedure, router } from '../trpc.ts';

export const taskOptions = router({
    all: procedure.query(({ ctx }) => {
        const { taskOptions } = ctx;
        return taskOptions.query();
    }),
    set: procedure.input(z.object({ id: z.string(), data: DateObjectSchema })).mutation(({ input, ctx }) => {
        const { id, data } = input;
        const { taskOptions } = ctx;
        return taskOptions.set(id, data);
    })
});
