import type { TaskInstance } from '@/features/mod';
import { buildDefaultConfig, getCompositeId } from '@sea/mod-resolver';

export function getTaskOptions(task: TaskInstance, taskConfig: Record<string, object | undefined>) {
    if (!task.configSchema) {
        return undefined;
    }

    const configId = getCompositeId({ scope: task.cid, id: task.metadata.id });

    if (taskConfig[configId]) {
        return taskConfig[configId];
    } else {
        return buildDefaultConfig(task.configSchema);
    }
}

export * from './hooks';
export * from './redux';
export type * from './types';
