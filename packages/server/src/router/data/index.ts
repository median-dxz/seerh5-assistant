import { router } from '../trpc.ts';
import { catchTime } from './catchTime.ts';
import { launcher } from './launcher.ts';
import { task } from './task.ts';

export const dataRouter = router({
    launcher,
    catchTime,
    task
});
