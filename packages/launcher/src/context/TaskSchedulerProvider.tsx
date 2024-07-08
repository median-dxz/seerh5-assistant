import { dateTime2hhmmss } from '@/shared';
import { LevelAction, levelManager, SEAEventSource, Subscription } from '@sea/core';
import type { LevelData, Task } from '@sea/mod-type';
import { produce } from 'immer';
import React, { useCallback, useEffect, useReducer, useState, type PropsWithChildren, type Reducer } from 'react';
import { TaskScheduler, type TaskState } from './useTaskScheduler';

interface ActionType {
    enqueue: { task: Task; runnerId: number; options?: Record<string, unknown> };
    dequeue: { runnerId: number };
    moveNext: undefined;
    changeRunnerStatus: { status: TaskState['status']; error?: Error };
    changeSchedulerStatus: { status: LevelSchedulerState['status'] };
    addRunnerBattleCount: undefined;
    addRunnerLog: { message: string };
    updateRunnerData: { data: LevelData };
    setPause: boolean;
}

interface Action {
    type: keyof ActionType;
    payload?: unknown;
}

type LevelSchedulerState = Pick<TaskScheduler, 'queue' | 'currentIndex' | 'status' | 'isPaused'>;

const reducer: Reducer<LevelSchedulerState, Action> = (prev, { type, payload }) =>
    produce(prev, (state) => {
        function enqueue({ task, options, runnerId }: ActionType['enqueue']) {
            const { queue } = state;
            queue.push({
                status: 'pending',
                logs: [],
                battleCount: 0,
                options,
                task,
                runnerId
            });
            if (state.currentIndex == undefined) {
                for (let i = 0; i < queue.length; i++) {
                    if (queue[i].status === 'pending') {
                        state.currentIndex = i;
                        break;
                    }
                }
            }
        }

        function dequeue(payload: ActionType['dequeue']) {
            const { queue } = state;
            const index = queue.findIndex((item) => item.runnerId === payload.runnerId);
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

        function moveNext() {
            if (state.currentIndex == undefined) {
                return;
            }
            state.currentIndex += 1;
            if (state.currentIndex >= state.queue.length) {
                state.currentIndex = undefined;
            }
        }

        function changeRunnerState(payload: ActionType['changeRunnerStatus']) {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.status = payload.status;
                if (payload.error) {
                    item.error = payload.error;
                }
                if (payload.status === 'running') {
                    item.startTime = Date.now();
                }
                if (payload.status === 'completed' || payload.status === 'error' || payload.status === 'stopped') {
                    item.endTime = Date.now();
                }
            }
        }

        function addRunnerBattleCount() {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.battleCount++;
            }
        }

        function addRunnerLog(payload: ActionType['addRunnerLog']) {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.logs.push(`[${dateTime2hhmmss.format(new Date())}] ${payload.message}`);
            }
        }

        function changeSchedulerState(payload: ActionType['changeSchedulerStatus']) {
            state.status = payload.status;
        }

        function updateRunnerData(payload: ActionType['updateRunnerData']) {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.runnerData = JSON.parse(JSON.stringify(payload.data)) as LevelData;
            }
        }

        function setPaused(payload: ActionType['setPause']) {
            state.isPaused = payload;
        }

        switch (type) {
            case 'enqueue':
                enqueue(payload as ActionType[typeof type]);
                break;
            case 'dequeue':
                dequeue(payload as ActionType[typeof type]);
                break;
            case 'moveNext':
                moveNext();
                break;
            case 'changeRunnerStatus':
                changeRunnerState(payload as ActionType[typeof type]);
                break;
            case 'changeSchedulerStatus':
                changeSchedulerState(payload as ActionType[typeof type]);
                break;
            case 'setPause':
                setPaused(payload as ActionType[typeof type]);
                break;
            case 'addRunnerBattleCount':
                addRunnerBattleCount();
                break;
            case 'addRunnerLog':
                addRunnerLog(payload as ActionType[typeof type]);
                break;
            case 'updateRunnerData':
                updateRunnerData(payload as ActionType[typeof type]);
                break;
            default:
                break;
        }
    });

export const TaskSchedulerProvider = ({ children }: PropsWithChildren<object>) => {
    const [counter, setCounter] = useState(0);
    const [state, dispatch] = useReducer(reducer, { queue: [], status: 'ready', isPaused: false });

    const changeSchedulerState = useCallback((status: LevelSchedulerState['status']) => {
        dispatch({
            type: 'changeSchedulerStatus',
            payload: { status } satisfies ActionType['changeSchedulerStatus']
        });
    }, []);

    const changeRunnerState = useCallback((status: TaskState['status'], error?: Error) => {
        dispatch({
            type: 'changeRunnerStatus',
            payload: { status, error } satisfies ActionType['changeRunnerStatus']
        });
    }, []);

    const tryStartNextRunner = useCallback(() => {
        const { isPaused, queue, status, currentIndex } = state;
        console.log(`关卡调度器: [tryStartNextRunner]: `, levelManager.running, state);
        if (isPaused || currentIndex == undefined || status !== 'ready') {
            return;
        }

        if (levelManager.running) {
            console.error(`关卡调度器: [tryStartNextRunner]: 不合理的State: ${JSON.stringify(state)}`);
            console.error(`LevelManger的上一次运行未释放`);
        }

        const { task, options } = queue[currentIndex];
        const metadata = task.metadata;
        const runner = task.runner(metadata, options as undefined);
        const sub = new Subscription();

        sub.on(SEAEventSource.levelManger('update'), () => {
            dispatch({
                type: 'updateRunnerData',
                payload: { data: runner.data } satisfies ActionType['updateRunnerData']
            });
        });
        sub.on(SEAEventSource.levelManger('nextAction'), (action) => {
            if (action === 'battle') {
                dispatch({ type: 'addRunnerBattleCount' });
            }
        });
        sub.on(SEAEventSource.levelManger('log'), (message) => {
            dispatch({ type: 'addRunnerLog', payload: { message } satisfies ActionType['addRunnerLog'] });
        });

        levelManager.run(runner);

        dispatch({
            type: 'updateRunnerData',
            payload: { data: runner.data }
        });
        changeRunnerState('running');
        changeSchedulerState('running');

        const { lock } = levelManager;
        lock!
            .then(() => {
                changeRunnerState('completed');
            })
            .catch((e: unknown) => {
                changeRunnerState('error', e as Error);
            })
            .finally(() => {
                if (runner.next() === LevelAction.STOP) {
                    changeRunnerState('completed');
                } else {
                    changeRunnerState('stopped');
                }
                sub.dispose();
                changeSchedulerState('ready');
                dispatch({ type: 'moveNext' });
            });
    }, [changeRunnerState, changeSchedulerState, state]);

    useEffect(() => {
        const { queue, isPaused, status, currentIndex } = state;
        if (isPaused || currentIndex == undefined || status !== 'ready') {
            return;
        }
        if (queue[currentIndex].status === 'pending') {
            tryStartNextRunner();
        }
    });

    const tryStopCurrentRunner = useCallback(async () => {
        if (state.status !== 'running') {
            return;
        }
        changeSchedulerState('waitingForStop');

        return levelManager.abort().catch((e: unknown) => {
            if (e instanceof Error) {
                console.error(`停止关卡失败: ${e.message}`);
            } else {
                console.error(`停止关卡失败: ${JSON.stringify(e)}`);
            }
        });
    }, [changeSchedulerState, state.status]);

    const handleEnqueue = useCallback(
        (task: Task, options?: Record<string, unknown>) => {
            const runnerId = counter;
            dispatch({ type: 'enqueue', payload: { task, options, runnerId } satisfies ActionType['enqueue'] });
            setCounter((counter) => counter + 1);
        },
        [counter]
    );

    const handleDequeue = useCallback(
        async (runnerId: number) => {
            if (state.queue.findIndex((r) => r.runnerId === runnerId) === state.currentIndex) {
                await tryStopCurrentRunner();
            }
            dispatch({ type: 'dequeue', payload: { runnerId } satisfies ActionType['dequeue'] });
        },
        [state, tryStopCurrentRunner]
    );

    const handlePause = useCallback(() => {
        dispatch({ type: 'setPause', payload: true });
        void tryStopCurrentRunner();
    }, [tryStopCurrentRunner]);

    const handleResume = useCallback(() => {
        dispatch({ type: 'setPause', payload: false });
    }, []);

    return (
        <TaskScheduler.Provider
            value={{
                queue: state.queue,
                currentIndex: state.currentIndex,
                status: state.status,
                isPaused: state.isPaused,
                enqueue: handleEnqueue,
                dequeue: handleDequeue,
                pause: handlePause,
                resume: handleResume,
                stopCurrentRunner: tryStopCurrentRunner
            }}
        >
            {children}
        </TaskScheduler.Provider>
    );
};
