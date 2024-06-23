import { MOD_SCOPE_DEFAULT } from '@/constants';
import * as endpoints from '@/services/endpoints';
import { CommonLogger, LogStyle } from '@/utils/logger';
import type { SEAConfigItemSchema, SEAModMetadata } from '@sea/mod-type';

type ProxyObjectRef<T extends NonNullable<object>> = T & { ref: T };
function createProxyObjectRef<T extends NonNullable<object>>(initValue: T) {
    const observable = {
        ref: initValue
    } as ProxyObjectRef<T>;

    const proxy = new Proxy(observable, {
        get(target, prop, receiver) {
            if (Object.hasOwn(target, prop)) {
                return Reflect.get(target, prop, receiver);
            } else {
                return Reflect.get(target.ref, prop, receiver);
            }
        },
        set(target, prop, value, receiver) {
            if (prop === 'ref') {
                return Reflect.set(target, prop, value, receiver);
            } else {
                return Reflect.set(target.ref, prop, value, receiver);
            }
        }
    });

    return proxy;
}
export const getLogger = (id: string) => CommonLogger(id, 'info', LogStyle.mod);

export function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload } = metadata;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.0.0';
    preload = preload ?? false;

    return { ...metadata, scope, version, preload } as SEAModMetadata & {
        version: string;
        scope: string;
        preload: boolean;
    };
}

export function getNamespace(meta: SEAModMetadata) {
    const { scope, id } = meta;
    return `${scope}::${id}`;
}

export async function getModData({ scope, id, data: defaultData }: SEAModMetadata & { scope: string }) {
    if (defaultData) {
        let data = await endpoints.mod.data(scope!, id);

        if (!data) {
            await endpoints.mod.setData(scope, id, defaultData);
            data = defaultData;
        }

        const proxyData = createProxyObjectRef(data);

        const mutate = (recipe: (draft: unknown) => void) => {
            recipe(proxyData.ref);
            endpoints.mod.setData(scope, id, proxyData.ref);
        };

        return { data: proxyData, mutate };
    }
    return {};
}

export async function getModConfig({ scope, id, configSchema }: SEAModMetadata & { scope: string }) {
    if (configSchema) {
        let config;
        config = await endpoints.mod.config(scope, id);
        if (!config) {
            config = buildDefaultConfig(configSchema);
            await endpoints.mod.setConfig(scope, id, config);
        }
        return { config };
    }
    return {};
}

export function buildDefaultConfig(configSchema: Record<string, SEAConfigItemSchema>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}
