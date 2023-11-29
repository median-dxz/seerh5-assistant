import path from 'node:path';
import { z } from 'zod';
import { ModConfig } from '../data/ModConfig.ts';
import { cachePets, launcherConfig, petFragmentLevel, queryPets, setLauncherConfig } from './routers/router.config.ts';
import { findMods } from './routers/router.mod.ts';
import { procedure, router } from './trpc.ts';

export const apiRouter = router({
    allMods: procedure.query(({ ctx }) => {
        const root = path.join(ctx.appRoot, 'mods');
        return findMods(root, root).map((path) => ({ path }));
    }),
    modConfig: procedure.input(z.string()).query(({ input }) => {
        const config = new ModConfig(input).load();
        if (config) {
            return { config };
        } else {
            throw new Error('配置不存在');
        }
    }),
    setModConfig: procedure.input(z.object({ namespace: z.string(), config: z.string() })).mutation(({ input }) => {
        const { namespace: ns, config: data } = input;
        const config = new ModConfig(ns);
        config.save(JSON.parse(data) as Record<string, unknown>);
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
    petFragmentLevel: procedure.query(({ ctx }) => {
        const { appRoot } = ctx;
        return petFragmentLevel(appRoot);
    }),
});

export type ApiRouter = typeof apiRouter;