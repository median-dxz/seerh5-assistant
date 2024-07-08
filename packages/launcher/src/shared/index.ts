import type { GetConfigObjectTypeFromSchema, LevelMeta, SEAConfigSchema, SEAFormItemSchema, Task } from '@sea/mod-type';
import type { TaskConfigData } from '@sea/server';

export function buildDefaultConfig(configSchema: Record<string, SEAFormItemSchema>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}

export function getTaskCurrentOptions(task: Task, taskConfig?: TaskConfigData | undefined): undefined;

export function getTaskCurrentOptions<TSchema extends SEAConfigSchema>(
    task: Task<LevelMeta, TSchema>,
    taskConfig?: TaskConfigData | undefined
): GetConfigObjectTypeFromSchema<TSchema>;

export function getTaskCurrentOptions<TSchema extends SEAConfigSchema | undefined>(
    task: Task<LevelMeta, TSchema>,
    taskConfig?: TaskConfigData | undefined
) {
    if (task.configSchema == undefined) {
        return undefined;
    }

    // 声明配置项, 声明现有配置但没找到对应的配置
    if (taskConfig?.currentOptions !== undefined && !taskConfig.options.has(taskConfig.currentOptions)) {
        throw new Error('未找到任务配置');
    }

    // 声明配置项, 未声明现有配置
    if (!taskConfig?.currentOptions) {
        return buildDefaultConfig(task.configSchema);
    }

    return taskConfig.options.get(taskConfig.currentOptions)!;
}

export const time2mmss = (n: number) => {
    n = Math.round(n / 1000);
    if (Object.is(n, -0)) {
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
