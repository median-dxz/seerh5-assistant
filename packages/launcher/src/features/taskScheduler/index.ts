import { createLocalPropsSelector } from '@/shared';
import { extraActions, taskScheduler as taskSchedulerSlice } from './slice';

export const taskScheduler = {
    reducer: taskSchedulerSlice.reducer,
    ...taskSchedulerSlice.actions,
    ...extraActions,
    ...taskSchedulerSlice.selectors,
    useSelectProps: createLocalPropsSelector(taskSchedulerSlice)
};

export type { TaskSchedulerState, TaskState } from './slice';
