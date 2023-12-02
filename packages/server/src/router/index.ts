import path from 'node:path';
import { z } from 'zod';
import { ModConfig } from '../data/ModConfig.ts';
import { PetCache } from '../data/PetCacheManager.ts';
import { cachePets, launcherConfig, petFragmentLevel, queryPets, setLauncherConfig } from './routers/router.config.ts';
import { findMods } from './routers/router.mod.ts';
import { procedure, router } from './trpc.ts';

export const apiRouter = router({
    allMods: procedure.query(({ ctx }) => {
        const root = path.join(ctx.appRoot, 'mods');
        return findMods(root, root).map((path) => ({ path }));
    }),
    modConfig: procedure
        .input(
            z.object({
                scope: z.string(),
                id: z.string(),
            })
        )
        .query(({ input: { id, scope } }) => {
            const config = new ModConfig(`${scope}::${id}`).load();
            if (config) {
                return config as unknown;
            } else {
                return null;
            }
        }),
    setModConfig: procedure
        .input(z.object({ scope: z.string(), id: z.string(), config: z.unknown() }))
        .mutation(({ input }) => {
            const { id, scope, config: data } = input;
            const config = new ModConfig(`${scope}::${id}`);
            config.save(data as Record<string, unknown>);
            return {
                success: true,
            };
        }),
    launcherConfig: procedure.input(z.string()).query(({ ctx, input: key }) => {
        const { appRoot } = ctx;
        return launcherConfig(key, appRoot);
    }),
    setLauncherConfig: procedure.input(z.object({ key: z.string(), value: z.unknown() })).mutation(({ ctx, input }) => {
        const { appRoot } = ctx;
        const { key, value } = input;
        return setLauncherConfig(key, appRoot, value);
    }),
    pets: procedure.input(z.string().optional()).query(({ input }) => {
        return queryPets(input);
    }),
    cachePets: procedure.input(z.map(z.string(), z.number())).mutation(({ input }) => {
        return cachePets(input);
    }),
    addCachePet: procedure.input(z.tuple([z.string(), z.number()])).mutation(({ input }) => {
        const [name, time] = input;
        const data = PetCache.catchTimeMap;
        data.set(name, time);
        return cachePets(data);
    }),
    removeCachePet: procedure.input(z.string()).mutation(({ input }) => {
        const data = PetCache.catchTimeMap;
        data.delete(input);
        return cachePets(data);
    }),
    petFragmentLevel: procedure.query(({ ctx }) => {
        const { appRoot } = ctx;
        return petFragmentLevel(appRoot);
    }),
});

export type ApiRouter = typeof apiRouter;
