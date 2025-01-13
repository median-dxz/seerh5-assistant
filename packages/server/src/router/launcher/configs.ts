import { z } from 'zod';
import { LauncherConfigKeys, PetGroupsSchema, type LauncherConfigType } from '../../configHandlers/LauncherConfig.ts';
import { procedure, router } from '../trpc.ts';

export const configs = router({
    item: procedure
        .input(z.object({ uid: z.string(), key: z.enum(LauncherConfigKeys) }))
        .query(({ input: { uid, key }, ctx }) => {
            const { launcherConfig } = ctx;
            return launcherConfig.item(uid, key);
        }),
    setItem: procedure
        .input(
            z.object({ uid: z.string(), key: z.enum(LauncherConfigKeys), value: z.unknown() }).refine((input) => {
                switch (input.key) {
                    case 'PetGroups':
                        return PetGroupsSchema.safeParse(input.value).success;
                    default:
                        return false;
                }
            })
        )
        .mutation(({ input: { uid, key, value }, ctx }) => {
            const { launcherConfig } = ctx;
            return launcherConfig.setItem(uid, key, value as LauncherConfigType[typeof key]);
        })
});
