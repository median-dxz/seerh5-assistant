import { z } from 'zod';
import { LauncherConfigKeys, PetGroupsSchema, type LauncherConfigType } from '../../configHandlers/LauncherConfig.ts';
import { procedure, router } from '../trpc.ts';

export const configs = router({
    item: procedure.input(z.enum(LauncherConfigKeys)).query(({ input, ctx }) => {
        const { launcherConfig } = ctx;
        const key = input;
        return launcherConfig.item(key);
    }),
    setItem: procedure
        .input(
            z.object({ key: z.enum(LauncherConfigKeys), value: z.unknown() }).refine((input) => {
                switch (input.key) {
                    case 'PetGroups':
                        return PetGroupsSchema.safeParse(input.value).success;
                    default:
                        return false;
                }
            })
        )
        .mutation(({ input, ctx }) => {
            const { key, value } = input;
            const { launcherConfig } = ctx;
            return launcherConfig.setItem(key, value as LauncherConfigType[typeof key]);
        })
});
