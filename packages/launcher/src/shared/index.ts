import type { SEAFormItemSchema } from '@sea/mod-type';

import type { DefinedModMetadata, TaskInstance } from '@/features/mod';

export function buildDefaultConfig(configSchema: Record<string, SEAFormItemSchema | undefined>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key]!;
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}

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

export function getCompositeId({ id, scope }: Pick<DefinedModMetadata, 'id' | 'scope'>) {
    scope = scope.replaceAll(':', '/:/');
    id = id.replaceAll(':', '/:/');
    return `${scope}::${id}`;
}

export const praseCompositeId = (compositeId: string) => {
    const [scope, id] = compositeId.split('::');
    return {
        scope: scope.replaceAll('/:/', ':'),
        id: id.replaceAll('/:/', ':')
    };
};

export * from './hooks';
export * from './redux';
export type * from './types';
