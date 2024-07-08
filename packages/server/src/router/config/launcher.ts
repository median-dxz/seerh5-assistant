import { z } from 'zod';
import {
    launcherConfig,
    LauncherConfigKeys,
    PetGroupsSchema,
    type LauncherConfigType
} from '../../data/LauncherConfig.ts';
import { procedure, router } from '../trpc.ts';

export const launcher = router({
    item: procedure.input(z.enum(LauncherConfigKeys)).query(({ input: key }) => launcherConfig.item(key)),
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
        .mutation(({ input }) => {
            const { key, value } = input;
            return launcherConfig.setItem(key, value as LauncherConfigType[typeof key]);
        })
});
