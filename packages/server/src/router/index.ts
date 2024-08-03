import { launcherRouter } from './launcher/index.ts';
import { modRouter } from './mod/index.ts';
import { router } from './trpc.ts';

export const apiRouter = router({
    modRouter,
    launcherRouter
});
