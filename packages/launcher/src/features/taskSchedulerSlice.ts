import { createAppSlice } from '@/shared/createAppSlice';
import { dateTime2hhmmss } from '@/shared/index';
import { startAppListening } from '@/shared/listenerMiddleware';
import type { AppRootState } from '@/store';
import { createAction, createAsyncThunk, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { LevelAction, levelManager } from '@sea/core';
import type { LevelData, Task } from '@sea/mod-type';
import { produce } from 'immer';
import { taskStore } from './mod/store';
import type { ModExportsRef } from './mod/utils';

export interface TaskState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    options?: Record<string, unknown>;
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

const abortLevelManager = async () =>
    levelManager.abort().catch((e: unknown) => {
        // TODO 超时处理 | 强制结束战斗处理 | 正常终止
        if (e instanceof Error) {
            console.error(`停止关卡失败: ${e.message}`);
        } else {
            console.error(`停止关卡失败: ${JSON.stringify(e)}`);
        }
    });

const shouldRunTask = (currentState: AppRootState) => {
    const { isPaused, status, currentIndex } = currentState.taskScheduler;
    if (isPaused || currentIndex == undefined || status !== 'idle') {
        return false;
    }
    if (levelManager.running) {
        console.error(
            [
                `关卡调度器: tryStartNextRunner: 不合理的State: ${JSON.stringify(currentState)}`,
                'LevelManger的上一次运行未释放'
            ].join('\n')
        );
        return false;
    }
    return true;
};

export const taskStateActions = {
    updateData: createAction<LevelData>('taskScheduler/taskState/updateData'),
    log: createAction<string>('taskScheduler/taskState/log'),
    increaseBattleCount: createAction('taskScheduler/taskState/increaseBattleCount')
};

const moveNext = createAction('taskScheduler/moveNext');
const run = createAsyncThunk<TaskState['status'], void, { state: AppRootState; rejectValue: Error }>(
    'taskScheduler/run',
    async (_, api) => {
        const state = api.getState().taskScheduler;
        console.log(`关卡调度器: tryStartNextRunner: `, state);

        const queue = state.queue;
        const currentIndex = state.currentIndex!;
        const { taskRef, options } = queue[currentIndex];
        const task = taskStore.get(taskRef)!;
        const runner = task.runner(options as undefined);

        try {
            await levelManager.run(runner);
            if (runner.next() === LevelAction.STOP) {
                return 'completed';
            } else {
                return 'stopped';
            }
        } catch (error) {
            return api.rejectWithValue(error as Error);
        }
    },
    {
        condition: (_, api) => shouldRunTask(api.getState())
    }
);

function createTaskStateReducer<TPayload>(
    itemReducer: (state: TaskState, action: PayloadAction<TPayload>) => void
): (state: TaskSchedulerState, action: PayloadAction<TPayload>) => void;

function createTaskStateReducer(
    itemReducer: (state: TaskState) => void
): (state: TaskSchedulerState, action: PayloadAction<never>) => void;

function createTaskStateReducer<TPayload>(itemReducer: (state: TaskState, action: PayloadAction<TPayload>) => void) {
    return (state: TaskSchedulerState, action: PayloadAction<TPayload>) => {
        const { queue, currentIndex } = state;
        if (currentIndex !== undefined) {
            queue[currentIndex] = produce(queue[currentIndex], (draft) => {
                itemReducer(draft, action);
            });
        }
    };
}

const taskSchedulerSlice = createAppSlice({
    name: 'taskScheduler',
    initialState,
    reducers: (create) => ({
        enqueue: create.preparedReducer(
            (ref: ModExportsRef, options?: object, runnerName?: string) => {
                counter++;
                const task = taskStore.get(ref);
                if (!task) {
                    throw new Error('task ref is not valid');
                }
                runnerName = runnerName ?? task.metadata.name;
                return { payload: { ref, options, runnerId: counter, runnerName } };
            },
            (state, action) => {
                const { options, runnerId, ref, runnerName } = action.payload;
                const { queue } = state;
                queue.push({
                    status: 'pending',
                    logs: [],
                    battleCount: 0,
                    options: options as Record<string, unknown>,
                    taskRef: ref,
                    runner: {
                        id: runnerId,
                        name: runnerName
                    }
                });
                if (state.currentIndex == undefined) {
                    state.currentIndex = queue.findIndex((item) => item.status === 'pending');
                }
            }
        ),
        dequeue: create.asyncThunk(
            async (runnerId: number, api) => {
                const {
                    taskScheduler: { queue, currentIndex }
                } = api.getState() as AppRootState;
                if (queue.findIndex((r) => r.runner.id === runnerId) === currentIndex) {
                    await abortLevelManager();
                }
                return runnerId;
            },
            {
                fulfilled: (state, action) => {
                    const runnerId = action.payload;
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
                if (state.status === 'running') {
                    state.status = 'waitingForStop';
                }
            },
            fulfilled: (state) => {
                state.isPaused = true;
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
        })
    }),
    extraReducers(builder) {
        builder
            .addCase(
                taskStateActions.updateData,
                createTaskStateReducer((state, action) => {
                    state.runner.data = JSON.parse(JSON.stringify(action.payload)) as LevelData; // deep copy
                })
            )
            .addCase(
                taskStateActions.log,
                createTaskStateReducer((state, action) => {
                    state.logs.push(`[${dateTime2hhmmss.format(new Date())}] ${action.payload}`);
                })
            )
            .addCase(
                taskStateActions.increaseBattleCount,
                createTaskStateReducer((state) => {
                    state.battleCount++;
                })
            )
            .addCase(moveNext, (state) => {
                if (state.currentIndex == undefined) {
                    return;
                }
                state.currentIndex += 1;
                if (state.currentIndex >= state.queue.length) {
                    state.currentIndex = undefined;
                }
            })
            .addCase(run.pending, (state, action) => {
                state.status = 'running';
                createTaskStateReducer((taskState) => {
                    taskState.startTime = Date.now();
                    taskState.status = 'running';
                })(state, action);
            })
            .addCase(
                run.fulfilled,
                createTaskStateReducer((taskState, action) => {
                    taskState.status = action.payload;
                })
            )
            .addCase(
                run.rejected,
                createTaskStateReducer((taskState, action) => {
                    taskState.status = 'error';
                    taskState.error = action.payload;
                })
            )
            .addMatcher(run.settled, (state, action) => {
                state.status = 'idle';
                createTaskStateReducer((taskState) => {
                    taskState.endTime = Date.now();
                })(state, action);
            });
    }
});

export const taskSchedulerReducer = taskSchedulerSlice.reducer;
export const taskSchedulerActions = { ...taskSchedulerSlice.actions, moveNext, run };

startAppListening({
    matcher: isAnyOf(
        taskSchedulerActions.moveNext,
        taskSchedulerActions.enqueue,
        taskSchedulerActions.resume,
        taskSchedulerActions.dequeue.fulfilled,
        taskSchedulerActions.abortCurrentRunner.fulfilled
    ),
    effect: async (_, { dispatch, getState, subscribe, unsubscribe }) => {
        if (shouldRunTask(getState())) {
            unsubscribe();
            await dispatch(taskSchedulerActions.run());
            subscribe();
            dispatch(taskSchedulerActions.moveNext());
        }
    }
});
