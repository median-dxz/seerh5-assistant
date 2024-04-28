import { z } from 'zod';
import {
    LauncherConfigKeys,
    PetGroupsSchema,
    launcherConfig,
    type LauncherConfigType
} from '../../data/LauncherConfig.ts';
import { petCatchTimeMap } from '../../data/PetCacheManager.ts';
import { petFragmentLevel } from '../../data/PetFragmentLevel.ts';
import { procedure, router } from '../trpc.ts';

export const configRouter = router({
    launcherConfig: procedure.input(z.enum(LauncherConfigKeys)).query(({ input: key }) => {
        return launcherConfig.getItem(key);
    }),
    setLauncherConfig: procedure
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
        }),
    allCatchTime: procedure.input(z.string().optional()).query(async ({ input: name }) => {
        if (name) {
            return [name, await petCatchTimeMap.getCatchTime(name)] as const;
        } else {
            return petCatchTimeMap.query();
        }
    }),
    updateAllCatchTime: procedure.input(z.map(z.string(), z.number())).mutation(({ input }) => {
        return petCatchTimeMap.mutate(() => input);
    }),
    setCatchTime: procedure.input(z.tuple([z.string(), z.number()])).mutation(({ input }) => {
        const [name, ct] = input;
        return petCatchTimeMap.updateCatchTime(name, ct);
    }),
    deleteCatchTime: procedure.input(z.string()).mutation(({ input }) => {
        return petCatchTimeMap.deleteCatchTime(input);
    }),
    petFragmentLevel: procedure.query(() => {
        return petFragmentLevel.query();
    })
});
