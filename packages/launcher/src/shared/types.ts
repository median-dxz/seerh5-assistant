import type { LevelMeta, SEAConfigSchema, Task } from '@sea/mod-type';

export type AnyTask = Task<LevelMeta, SEAConfigSchema | undefined>;
