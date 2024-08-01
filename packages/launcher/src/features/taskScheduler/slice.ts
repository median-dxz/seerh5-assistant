import { createAction, createReducer, isAnyOf, type UnknownAction } from '@reduxjs/toolkit';
import { dequal } from 'dequal';

import { LevelAction, levelManager } from '@sea/core';
import type { LevelData, Task } from '@sea/mod-type';

import { createAppSlice, startAppListening } from '@/shared';
import type { AppRootState } from '@/store';

import { type ModExportsRef, ModStore } from '../mod';

import { abortLevelManager, shouldRunTask } from './utils';

export interface TaskState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    options?: object;
    startTime?: number;
    endTime?: number;
    logs: string[];
    battleCount: number;
    taskRef: ModExportsRef;
    runner: {
        id: number;
        name: string;
        data?: ReturnType<Task['runner']>['data'];
    };
}

export interface TaskSchedulerState {
    queue: TaskState[];
    currentIndex?: number;
    /** idle表示队列为空或者被暂停 */
    status: 'idle' | 'running' | 'waitingForStop';
    isPaused: boolean;
}

const initialState: TaskSchedulerState = {
    queue: [],
    isPaused: false,
    status: 'idle'
};

let counter = 0;

export const extraActions = {
    updateRunnerData: createAction<LevelData>('taskScheduler/updateRunnerData'),
    traceRunnerLog: createAction<string>('taskScheduler/traceRunnerLog'),
    increaseBattleCount: createAction('taskScheduler/increaseBattleCount')
};

function updateCurrentTaskState(state: TaskSchedulerState, action: UnknownAction) {
    const { queue, currentIndex } = state;
    if (currentIndex !== undefined) {
        queue[currentIndex] = taskStateReducer(queue[currentIndex], action);
    }
}

export const taskScheduler = createAppSlice({
    name: 'taskScheduler',
    initialState,
    reducers: (create) => ({
        enqueue: create.preparedReducer(
            (ref: ModExportsRef, options?: object, runnerName?: string) => {
                counter++;
                const task = ModStore.getTask(ref)!;
                runnerName = runnerName ?? task.metadata.name;
                const payload = {
                    taskRef: ref,
                    options,
                    runner: {
                        id: counter,
                        name: runnerName
                    }
                };
                return { payload };
            },
            (state, action) => {
                const { options, runner, taskRef } = action.payload;
                const { queue } = state;
                queue.push({
                    status: 'pending',
                    logs: [],
                    battleCount: 0,
                    options,
                    taskRef,
                    runner
                });
                if (state.currentIndex == undefined) {
                    state.currentIndex = queue.findIndex((item) => item.status === 'pending');
                }
            }
        ),
        dequeue: create.asyncThunk<void, number>(
            async (runnerId, { getState }) => {
                if (selectors.isCurrentTaskByRunnerId(getState() as AppRootState, runnerId)) {
                    await abortLevelManager();
                }
            },
            {
                fulfilled: (state, action) => {
                    const runnerId = action.meta.arg;
                    const { queue } = state;
                    const index = queue.findIndex((item) => item.runner.id === runnerId);
                    if (index !== -1) {
                        if (state.currentIndex && index < state.currentIndex) {
                            state.currentIndex = state.currentIndex - 1;
                        }
                        queue.splice(index, 1);
                        if (queue.length === 0 || (state.currentIndex && state.currentIndex >= queue.length)) {
                            state.currentIndex = undefined;
                        }
                    }
                }
            }
        ),
        pause: create.asyncThunk<void>(abortLevelManager, {
            pending: (state) => {
                state.isPaused = true;
                if (state.status === 'running') {
                    state.status = 'waitingForStop';
                }
            },
            fulfilled: (state) => {
                state.status = 'idle';
            }
        }),
        resume: create.reducer((state) => {
            state.isPaused = false;
        }),
        abortCurrentRunner: create.asyncThunk<void>(abortLevelManager, {
            pending: (state) => {
                state.status = 'waitingForStop';
            },
            options: {
                condition(_, api): boolean {
                    const { taskScheduler } = api.getState() as AppRootState;
                    return taskScheduler.status === 'running';
                }
            }
        }),
        moveToNext: create.reducer((state) => {
            if (state.currentIndex == undefined) {
                return;
            }
            state.currentIndex += 1;
            if (state.currentIndex >= state.queue.length) {
                state.currentIndex = undefined;
            }
        }),
        run: create.asyncThunk<TaskState['status'], void, { rejectValue: Error }>(
            async (_, { rejectWithValue, getState }) => {
                const state = getState() as AppRootState;
                const { taskRef, options } = selectors.currentTask(state)!;
                const task = ModStore.getTask(taskRef);

                console.log(`关卡调度器: tryStartNextRunner: `, state.taskScheduler);
                if (!task) {
                    throw new Error('invalid task ref');
                }

                const runner = task.runner(options as undefined);

                try {
                    await levelManager.run(runner);
                    if (runner.next() === LevelAction.STOP) {
                        return 'completed';
                    } else {
                        return 'stopped';
                    }
                } catch (error) {
                    return rejectWithValue(error as Error);
                }
            },
            {
                pending: (state) => {
                    state.status = 'running';
                },
                settled: (state) => {
                    state.status = 'idle';
                },
                options: {
                    condition: (_, { getState }): boolean => shouldRunTask(getState() as AppRootState)
                }
            }
        )
    }),
    extraReducers(builder) {
        builder.addMatcher(
            isAnyOf(
                extraActions.updateRunnerData,
                extraActions.traceRunnerLog,
                extraActions.increaseBattleCount,
                actions.run.pending,
                actions.run.fulfilled,
                actions.run.rejected
            ),
            updateCurrentTaskState
        );
    },
    selectors: {
        currentTask: ({ queue, currentIndex }) => (currentIndex !== undefined ? queue[currentIndex] : undefined),
        isCurrentTaskByRunnerId: ({ queue, currentIndex }, runnerId: number) =>
            currentIndex !== undefined && queue[currentIndex].runner.id === runnerId,
        isCurrentTaskByRefAndOptions: ({ queue, currentIndex }, ref: ModExportsRef, options?: object) => {
            if (currentIndex === undefined) return false;
            const taskState = queue[currentIndex];
            return taskState.taskRef === ref && dequal(taskState.options, options);
        },
        status: ({ status, isPaused: pause }) => {
            if (status === 'idle' && pause) {
                return 'pause';
            }
            return status;
        }
    }
});

const { actions, selectors } = taskScheduler;

const taskStateReducer = createReducer<TaskState>({} as TaskState, (builder) => {
    builder
        .addCase(extraActions.updateRunnerData, (state, action) => {
            state.runner.data = structuredClone(action.payload);
        })
        .addCase(extraActions.traceRunnerLog, (state, action) => {
            state.logs.push(action.payload);
        })
        .addCase(extraActions.increaseBattleCount, (state) => {
            state.battleCount++;
        })
        .addCase(actions.run.pending, (state) => {
            state.startTime = Date.now();
            state.status = 'running';
        })
        .addCase(actions.run.fulfilled, (state, action) => {
            state.status = action.payload;
        })
        .addCase(actions.run.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.payload;
        })
        .addMatcher(actions.run.settled, (state) => {
            state.endTime = Date.now();
        });
});

startAppListening({
    matcher: isAnyOf(
        actions.moveToNext,
        actions.enqueue,
        actions.resume,
        actions.dequeue.fulfilled,
        actions.abortCurrentRunner.fulfilled
    ),
    effect: async (_, { dispatch, getState, subscribe, unsubscribe }) => {
        if (shouldRunTask(getState())) {
            unsubscribe();
            await dispatch(actions.run());
            subscribe();
            dispatch(actions.moveToNext());
        }
    }
});
