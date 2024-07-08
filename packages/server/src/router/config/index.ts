import { router } from '../trpc.ts';
import { catchTime } from './catchTime.ts';
import { launcher } from './launcher.ts';
import { task } from './task.ts';

export const configRouter = router({
    launcher,
    catchTime,
    task
});
