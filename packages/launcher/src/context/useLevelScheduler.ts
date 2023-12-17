import { createContext, useContext } from 'react';
type LevelRunner = SEAL.LevelRunner;

export interface LevelRunnerState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    runner: LevelRunner;
    startTime?: number;
    endTime?: number;
    // TODO
    logs: string[];
    battleCount: number;
}

export interface LevelScheduler {
    queue: Array<LevelRunnerState>;
    currentIndex?: number;
    /** 注意不是LevelManager的状态, 而是调度器自身的, ready表示队列为空或者被暂停 */
    status: 'ready' | 'running' | 'waitingForStop';
    isPaused: boolean;
    enqueue: (runner: LevelRunner) => void;
    dequeue: (runner: LevelRunner) => void;
    pause: () => void;
    resume: () => void;
    stopCurrentRunner: () => void;
}

export const LevelScheduler = createContext<LevelScheduler>({} as LevelScheduler);

export function useLevelScheduler() {
    return useContext(LevelScheduler);
}
