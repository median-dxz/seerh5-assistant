/* eslint-disable @typescript-eslint/no-unused-vars */
import { produce } from 'immer';
import React, { useCallback, useEffect, useReducer, useRef, type PropsWithChildren, type Reducer } from 'react';
import { LevelManager, type ILevelRunner } from 'sea-core';
import { LevelScheduler, type LevelRunnerState } from './useLevelScheduler';
const { ins: levelManager } = LevelManager;

type ActionType = {
    enqueue: { runner: ILevelRunner };
    dequeue: { runner: ILevelRunner };
    moveNext: undefined;
    changeRunnerStatus: { status: LevelRunnerState['status']; error?: Error };
    changeSchedulerStatus: { status: LevelSchedulerState['status'] };
    setPause: boolean;
};

type Action = {
    type: keyof ActionType;
    payload?: unknown;
};

type LevelSchedulerState = Pick<LevelScheduler, 'queue' | 'currentIndex' | 'status' | 'isPaused'>;

const reducer: Reducer<LevelSchedulerState, Action> = (state, { type, payload }) => {
    function enqueue(prev: LevelSchedulerState, payload: ActionType['enqueue']) {
        return produce(prev, (state) => {
            const { queue } = state;
            queue.push({ runner: payload.runner, status: 'pending' });
            if (queue.length === 1) {
                state.currentIndex = 0;
            }
        });
    }

    function dequeue(prev: LevelSchedulerState, payload: ActionType['dequeue']) {
        return produce(prev, (state) => {
            const { queue } = state;
            const index = queue.findIndex((item) => item.runner === payload.runner);
            if (index !== -1) {
                if (queue.length === 1 || index === queue.length - 1) {
                    state.currentIndex = undefined;
                }
                if (index < state.currentIndex!) {
                    state.currentIndex = state.currentIndex! - 1;
                }
                queue.splice(index, 1);
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
        default:
            return state;
    }
};

export const LevelSchedulerProvider = ({ children }: PropsWithChildren<object>) => {
    const [state, dispatch] = useReducer(reducer, { queue: [], status: 'ready', isPaused: false });
    const updateRequest = useRef<boolean>(false);

    const changeSchedulerState = useCallback((status: LevelSchedulerState['status']) => {
        dispatch({
            type: 'changeSchedulerStatus',
            payload: { status } as ActionType['changeSchedulerStatus'],
        });
    }, []);

    const changeRunnerState = useCallback((status: LevelRunnerState['status'], error?: Error) => {
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

    const handleEnqueue = useCallback((runner: ILevelRunner) => {
        dispatch({ type: 'enqueue', payload: { runner } });
        updateRequest.current = true;
    }, []);

    const handleDequeue = useCallback(
        async (runner: ILevelRunner) => {
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
        dispatch({ type: 'moveNext' });
        updateRequest.current = true;
    }, [tryStopCurrentRunner]);

    return (
        <LevelScheduler.Provider
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
        </LevelScheduler.Provider>
    );
};
