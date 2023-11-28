import { router } from './trpc.ts';

import { configRouter } from './routers/router.config.ts';
import { modRouter } from './routers/router.mod.ts';

export const appRouter = router({
    mod: configRouter,
    config: modRouter,
});

export type AppRouter = typeof appRouter;
