import { createContext, useContext } from 'react';
type TaskRunner = SEAL.TaskRunner;

export interface TaskState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    runner: TaskRunner;
    startTime?: number;
    endTime?: number;
    // TODO
    logs: string[];
    battleCount: number;
}

export interface TaskScheduler {
    queue: Array<TaskState>;
    currentIndex?: number;
    /** 注意不是LevelManager的状态, 而是调度器自身的, ready表示队列为空或者被暂停 */
    status: 'ready' | 'running' | 'waitingForStop';
    isPaused: boolean;
    enqueue: (runner: TaskRunner) => void;
    dequeue: (runner: TaskRunner) => void;
    pause: () => void;
    resume: () => void;
    stopCurrentRunner: () => void;
}

export const TaskScheduler = createContext<TaskScheduler>({} as TaskScheduler);

export function useTaskScheduler() {
    return useContext(TaskScheduler);
}
