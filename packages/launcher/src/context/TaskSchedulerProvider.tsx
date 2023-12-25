/* eslint-disable @typescript-eslint/no-unused-vars */
import type { TaskRunner } from '@/sea-launcher';
import { levelManager, SEAEventSource, Subscription } from '@sea/core';
import { produce } from 'immer';
import React, { useCallback, useEffect, useReducer, useRef, type PropsWithChildren, type Reducer } from 'react';
import { TaskScheduler, type TaskState } from './useTaskScheduler';

type ActionType = {
    enqueue: { runner: TaskRunner };
    dequeue: { runner: TaskRunner };
    moveNext: undefined;
    changeRunnerStatus: { status: TaskState['status']; error?: Error };
    changeSchedulerStatus: { status: LevelSchedulerState['status'] };
    addRunnerBattleCount: undefined;
    logWithRunner: { message: string };
    setPause: boolean;
};

type Action = {
    type: keyof ActionType;
    payload?: unknown;
};

type LevelSchedulerState = Pick<TaskScheduler, 'queue' | 'currentIndex' | 'status' | 'isPaused'>;

const reducer: Reducer<LevelSchedulerState, Action> = (state, { type, payload }) => {
    function enqueue(prev: LevelSchedulerState, payload: ActionType['enqueue']) {
        return produce(prev, (state) => {
            const { queue } = state;
            queue.push({ runner: payload.runner, status: 'pending', logs: [], battleCount: 0 });
            if (state.currentIndex == undefined) {
                for (let i = 0; i < queue.length; i++) {
                    if (queue[i].status === 'pending') {
                        state.currentIndex = i;
                        break;
                    }
                }
            }
        });
    }

    function dequeue(prev: LevelSchedulerState, payload: ActionType['dequeue']) {
        return produce(prev, (state) => {
            const { queue } = state;
            const index = queue.findIndex((item) => item.runner === payload.runner);
            if (index !== -1) {
                if (state.currentIndex && index < state.currentIndex) {
                    state.currentIndex = state.currentIndex - 1;
                }
                queue.splice(index, 1);
                if (queue.length === 0 || (state.currentIndex && state.currentIndex >= queue.length)) {
                    state.currentIndex = undefined;
                }
            }
        });
    }

    function moveNext(prev: LevelSchedulerState) {
        return produce(prev, (state) => {
            if (state.currentIndex == undefined) {
                return;
            }
            state.currentIndex += 1;
            if (state.currentIndex >= state.queue.length) {
                state.currentIndex = undefined;
            }
        });
    }

    function changeRunnerStatus(prev: LevelSchedulerState, payload: ActionType['changeRunnerStatus']) {
        return produce(prev, (state) => {
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
        });
    }

    function addRunnerBattleCount(prev: LevelSchedulerState) {
        return produce(prev, (state) => {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.battleCount++;
            }
        });
    }

    function logWithRunner(prev: LevelSchedulerState, payload: ActionType['logWithRunner']) {
        return produce(prev, (state) => {
            const { queue, currentIndex } = state;
            if (currentIndex != undefined) {
                const item = queue[currentIndex];
                item.logs.push(payload.message);
            }
        });
    }

    function changeSchedulerStatus(prev: LevelSchedulerState, payload: ActionType['changeSchedulerStatus']) {
        return produce(prev, (state) => {
            state.status = payload.status;
        });
    }

    function setPaused(prev: LevelSchedulerState, payload: ActionType['setPause']) {
        return produce(prev, (state) => {
            state.isPaused = payload;
        });
    }

    switch (type) {
        case 'enqueue':
            return enqueue(state, payload as ActionType[typeof type]);
        case 'dequeue':
            return dequeue(state, payload as ActionType[typeof type]);
        case 'moveNext':
            return moveNext(state);
        case 'changeRunnerStatus':
            return changeRunnerStatus(state, payload as ActionType[typeof type]);
        case 'changeSchedulerStatus':
            return changeSchedulerStatus(state, payload as ActionType[typeof type]);
        case 'setPause':
            return setPaused(state, payload as ActionType[typeof type]);
        case 'addRunnerBattleCount':
            return addRunnerBattleCount(state);
        case 'logWithRunner':
            return logWithRunner(state, payload as ActionType[typeof type]);
        default:
            return state;
    }
};

export const TaskSchedulerProvider = ({ children }: PropsWithChildren<object>) => {
    const [state, dispatch] = useReducer(reducer, { queue: [], status: 'ready', isPaused: false });
    const updateRequest = useRef<boolean>(false);

    const changeSchedulerState = useCallback((status: LevelSchedulerState['status']) => {
        dispatch({
            type: 'changeSchedulerStatus',
            payload: { status } as ActionType['changeSchedulerStatus'],
        });
    }, []);

    const changeRunnerState = useCallback((status: TaskState['status'], error?: Error) => {
        dispatch({
            type: 'changeRunnerStatus',
            payload: { status, error } as ActionType['changeRunnerStatus'],
        });
    }, []);

    const tryStartNextRunner = useCallback(() => {
        const { isPaused, queue, status, currentIndex } = state;
        console.log(`tryStartNextRunner`, levelManager.running, state);
        if (isPaused || currentIndex == undefined || status !== 'ready') {
            return;
        }

        if (levelManager.running) {
            console.error(`关卡调度器: 不合理的State: ${state}`);
            console.error(`LevelManger的上一次运行未释放`);
        }

        changeRunnerState('running');
        changeSchedulerState('running');

        const { runner } = queue[currentIndex];

        // TODO! 在后端日志功能完善后 重新设计该部分
        runner.logger = new Proxy(runner.logger, {
            apply(target, thisArg, argArray) {
                dispatch({ type: 'logWithRunner', payload: { message: argArray[0] } });
                return Reflect.apply(target, thisArg, argArray);
            },
        });

        levelManager.run(runner);

        const { lock } = levelManager;

        lock!
            .then(() => {
                changeRunnerState('completed');
            })
            .catch((e) => {
                changeRunnerState('error', e);
            })
            .finally(async () => {
                try {
                    await levelManager.stop();
                } catch (e) {
                    console.error(e);
                }
                changeSchedulerState('ready');
                dispatch({ type: 'moveNext' });
                updateRequest.current = true;
            });
    }, [changeSchedulerState, changeRunnerState, state]);

    useEffect(() => {
        if (!updateRequest.current) {
            return;
        }
        updateRequest.current = false;
        tryStartNextRunner();
    });

    useEffect(() => {
        const sub = new Subscription();
        sub.on(SEAEventSource.hook('battle:start'), () => {
            dispatch({ type: 'addRunnerBattleCount' });
        });
        return () => sub.dispose();
    }, []);

    const tryStopCurrentRunner = useCallback(() => {
        if (state.status !== 'running') {
            return;
        }
        changeSchedulerState('waitingForStop');
        return levelManager
            .stop()
            .catch((err) => {
                console.error(`停止关卡失败: ${err}`);
            })
            .finally(() => {
                changeSchedulerState('ready');
                changeRunnerState('stopped');
            });
    }, [changeRunnerState, changeSchedulerState, state.status]);

    const handleEnqueue = useCallback((runner: TaskRunner) => {
        dispatch({ type: 'enqueue', payload: { runner } });
        updateRequest.current = true;
    }, []);

    const handleDequeue = useCallback(
        async (runner: TaskRunner) => {
            if (state.queue.findIndex((r) => r.runner === runner) === state.currentIndex) {
                await tryStopCurrentRunner();
                dispatch({ type: 'dequeue', payload: { runner } });
                updateRequest.current = true;
            } else {
                dispatch({ type: 'dequeue', payload: { runner } });
            }
        },
        [state, tryStopCurrentRunner]
    );

    const handlePause = useCallback(async () => {
        dispatch({ type: 'setPause', payload: true });
        await tryStopCurrentRunner();
    }, [tryStopCurrentRunner]);

    const handleResume = useCallback(() => {
        dispatch({ type: 'setPause', payload: false });
        updateRequest.current = true;
    }, []);

    const handleStopCurrentRunner = useCallback(async () => {
        await tryStopCurrentRunner();
        updateRequest.current = true;
    }, [tryStopCurrentRunner]);

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
                stopCurrentRunner: handleStopCurrentRunner,
            }}
        >
            {children}
        </TaskScheduler.Provider>
    );
};
