import type { LevelMeta, SEAConfigSchema, Task } from '@sea/mod-type';

export type AnyTask = Task<LevelMeta, SEAConfigSchema | undefined>;
export type AsyncDataState = 'empty' | 'idle' | 'loading' | 'error';
export type TaskRunner = ReturnType<Task['runner']>;
