import { z } from 'zod';
import { petCatchTimeMap } from '../../data/PetCacheManager.ts';
import { procedure, router } from '../trpc.ts';

export const catchTime = router({
    all: procedure.input(z.string().optional()).query(async ({ input: name }) => {
        if (name) {
            return [name, await petCatchTimeMap.catchTime(name)] as const;
        } else {
            return petCatchTimeMap.query();
        }
    }),

    mutate: procedure.input(z.map(z.string(), z.number())).mutation(({ input }) => petCatchTimeMap.mutate(() => input)),

    set: procedure.input(z.tuple([z.string(), z.number()])).mutation(({ input }) => {
        const [name, ct] = input;
        return petCatchTimeMap.updateCatchTime(name, ct);
    }),

    delete: procedure.input(z.string()).mutation(({ input }) => petCatchTimeMap.deleteCatchTime(input))
});
