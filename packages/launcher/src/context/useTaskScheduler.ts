import type { Task } from '@sea/mod-type';
import { createContext, useContext } from 'react';

export type TaskRunner = ReturnType<Task['runner']>;

export interface TaskState {
    status: 'pending' | 'running' | 'completed' | 'error' | 'stopped';
    error?: Error;
    options?: Record<string, unknown>;
    startTime?: number;
    endTime?: number;
    logs: string[];
    battleCount: number;
    task: Task;
    runnerId: number;
    runnerData?: ReturnType<Task['runner']>['data'];
}

export interface TaskScheduler {
    queue: TaskState[];
    currentIndex?: number;
    /** 注意不是LevelManager的状态, 而是调度器自身的, ready表示队列为空或者被暂停 */
    status: 'ready' | 'running' | 'waitingForStop';
    isPaused: boolean;
    enqueue: (task: Task, options?: Record<string, unknown>) => void;
    dequeue: (runnerId: number) => void;
    pause: () => void;
    resume: () => void;
    stopCurrentRunner: () => Promise<void>;
}

export const TaskScheduler = createContext<TaskScheduler>({} as TaskScheduler);

export function useTaskScheduler() {
    return useContext(TaskScheduler);
}
