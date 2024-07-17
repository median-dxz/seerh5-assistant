import type { TaskInstance } from '@/features/mod/store';
import { getCompositeId } from '@/features/mod/utils';
import type { SEAFormItemSchema } from '@sea/mod-type';

export function buildDefaultConfig(configSchema: Record<string, SEAFormItemSchema>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
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

export const time2mmss = (n: number) => {
    n = Math.round(n / 1000);
    if (Object.is(n, -0) || n < 0) {
        n = 0;
    }
    const format = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2
    });
    return `${format.format(Math.trunc(n / 60))}:${format.format(n % 60)}`;
};

export const dateTime2hhmmss = Intl.DateTimeFormat('zh-cn', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});
