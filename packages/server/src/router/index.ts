import { configRouter } from './config/index.ts';
import { modRouter } from './mod/index.ts';
import { router } from './trpc.ts';

export const apiRouter = router({
    modRouter,
    configRouter
});

export type ApiRouter = typeof apiRouter;
