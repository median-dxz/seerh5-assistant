import * as endpoints from '@/services/endpoints';
import { CommonLogger, LogStyle } from '@/utils/logger';
import type { SEAModMetadata } from '@sea/mod-type';
import { buildDefaultConfig } from './metadata';

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

export async function getModData({ scope, id, data: defaultData }: SEAModMetadata & { scope: string }) {
    if (defaultData) {
        let data = await endpoints.mod.data(scope, id);

        if (!data) {
            await endpoints.mod.setData(scope, id, defaultData);
            data = defaultData;
        }

        const proxyData = createProxyObjectRef(data);

        const mutate = (recipe: (draft: unknown) => void) => {
            recipe(proxyData.ref);
            void endpoints.mod.setData(scope, id, proxyData.ref);
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
