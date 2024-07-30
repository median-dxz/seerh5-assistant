import type { SEAConfigSchema, Task } from '@sea/mod-type';

export type AsyncDataState = 'empty' | 'idle' | 'loading' | 'error';
export type TaskRunner = ReturnType<Task['runner']>;
export interface AnyTask {
    readonly metadata: {
        id: string;
        name: string;
    };
    readonly configSchema?: SEAConfigSchema;
    runner(options?: unknown): TaskRunner;
}
