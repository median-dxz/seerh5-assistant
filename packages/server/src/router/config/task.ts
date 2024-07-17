import { z } from 'zod';
import { taskConfig } from '../../data/TaskConfig.ts';
import { DateObjectSchema } from '../../shared/schemas.ts';
import { procedure, router } from '../trpc.ts';

export const task = router({
    all: procedure.query(() => taskConfig.query()),
    remove: procedure.input(z.string()).mutation(({ input }) => taskConfig.removeOptions(input)),
    options: procedure.input(z.string()).query(({ input }) => taskConfig.options(input)),
    set: procedure.input(z.object({ id: z.string(), data: DateObjectSchema })).mutation(({ input }) => {
        const { id, data } = input;
        return taskConfig.setOptions(id, data);
    })
});
