import { router } from '../trpc.ts';
import { catchTime } from './catchTime.ts';
import { configs } from './configs.ts';
import { taskOptions } from './taskOptions.ts';

export const launcherRouter = router({
    configs,
    catchTime,
    taskOptions
});
