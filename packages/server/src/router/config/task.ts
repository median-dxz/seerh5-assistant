import { z } from 'zod';
import { taskConfig } from '../../data/TaskConfig.ts';
import { DateObjectSchema } from '../../shared/schemas.ts';
import { procedure, router } from '../trpc.ts';

export const task = router({
    all: procedure.query(() => taskConfig.query()),
    remove: procedure.input(z.string()).mutation(({ input }) => taskConfig.remove(input)),
    allOptions: procedure.input(z.string()).query(({ input }) => taskConfig.allOptions(input)),
    options: procedure.input(z.tuple([z.string(), z.string()])).query(({ input }) => {
        const [taskId, name] = input;
        return taskConfig.options(taskId, name);
    }),
    addOptions: procedure
        .input(z.tuple([z.string(), z.string(), z.record(z.string(), DateObjectSchema)]))
        .mutation(({ input }) => {
            const [taskId, name, data] = input;
            return taskConfig.addOptions(taskId, name, data);
        }),
    removeOptions: procedure.input(z.tuple([z.string(), z.string()])).mutation(({ input }) => {
        const [taskId, name] = input;
        return taskConfig.removeOptions(taskId, name);
    }),
    currentOptions: procedure.input(z.string()).query(({ input }) => taskConfig.currentOptions(input)),
    setCurrentOptions: procedure.input(z.tuple([z.string(), z.string()])).mutation(({ input }) => {
        const [taskId, name] = input;
        return taskConfig.setCurrentOptions(taskId, name);
    })
});
