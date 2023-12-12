import { createContext, useContext } from 'react';
import type { ILevelRunner } from 'sea-core';

export interface LevelRunnerState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    runner: ILevelRunner;
}

export interface LevelScheduler {
    queue: Array<LevelRunnerState>;
    currentIndex?: number;
    /** 注意不是LevelManager的状态, 而是调度器自身的, ready表示队列为空或者被暂停 */
    status: 'ready' | 'running' | 'waitingForStop';
    isPaused: boolean;
    enqueue: (runner: ILevelRunner) => void;
    dequeue: (runner: ILevelRunner) => void;
    pause: () => void;
    resume: () => void;
    stopCurrentRunner: () => void;
}

export const LevelScheduler = createContext<LevelScheduler>({} as LevelScheduler);

export function useLevelScheduler() {
    return useContext(LevelScheduler);
}
