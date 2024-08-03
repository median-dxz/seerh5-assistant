import { z } from 'zod';
import { procedure, router } from '../trpc.ts';

export const catchTime = router({
    all: procedure.input(z.string().optional()).query(async ({ input, ctx }) => {
        const name = input;
        const { petCatchTime } = ctx;
        if (name) {
            return [name, await petCatchTime.catchTime(name)] as const;
        } else {
            return petCatchTime.query();
        }
    }),

    mutate: procedure.input(z.map(z.string(), z.number())).mutation(({ input, ctx }) => {
        const newMap = input;
        const { petCatchTime } = ctx;
        return petCatchTime.mutate(() => newMap);
    }),

    set: procedure.input(z.tuple([z.string(), z.number()])).mutation(({ input, ctx }) => {
        const [name, ct] = input;
        const { petCatchTime } = ctx;
        return petCatchTime.update(name, ct);
    }),

    delete: procedure.input(z.string()).mutation(({ input, ctx }) => {
        const name = input;
        const { petCatchTime } = ctx;
        return petCatchTime.delete(name);
    })
});
