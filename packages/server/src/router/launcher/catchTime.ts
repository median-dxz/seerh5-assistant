import { z } from 'zod';
import { procedure, router } from '../trpc.ts';

export const catchTime = router({
    all: procedure
        .input(z.object({ uid: z.string(), name: z.string().optional() }))
        .query(async ({ input: { uid, name }, ctx }) => {
            const { petCatchTime } = ctx;
            if (name) {
                return [name, await petCatchTime.catchTime(uid, name)] as const;
            } else {
                return petCatchTime.query(uid);
            }
        }),

    mutate: procedure
        .input(
            z.object({
                uid: z.string(),
                map: z.map(z.string(), z.number())
            })
        )
        .mutation(({ input, ctx }) => {
            const { map, uid } = input;
            const { petCatchTime } = ctx;
            return petCatchTime.mutate(uid, () => map);
        }),

    set: procedure
        .input(z.object({ uid: z.string(), name: z.string(), ct: z.number() }))
        .mutation(({ input: { uid, name, ct }, ctx }) => {
            const { petCatchTime } = ctx;
            return petCatchTime.update(uid, name, ct);
        }),

    delete: procedure
        .input(z.object({ uid: z.string(), name: z.string() }))
        .mutation(({ input: { uid, name }, ctx }) => {
            const { petCatchTime } = ctx;
            return petCatchTime.delete(uid, name);
        })
});
