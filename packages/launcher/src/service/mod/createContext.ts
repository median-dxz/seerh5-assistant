import { MOD_SCOPE_DEFAULT } from '@/constants';
import type { CreateContextOptions, ModContext, ModMeta, SEAConfigSchema } from '@/sea-launcher';
import * as endpoints from '@/service/endpoints';
import * as ctStore from '@/service/store/CatchTimeBinding';
import { store as battleStore } from '@/service/store/battle';
import { CommonLogger, LogStyle } from '@/utils/logger';

type ProxyObjectRef<T extends object> = T & { ref: T };

function createProxyObjectRef<T extends object>(initValue: T) {
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

const getLogger = (id: string) => CommonLogger(id, 'info', LogStyle.mod);

export function buildMeta(meta: Partial<ModMeta>) {
    let { scope, version } = meta;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.0.0';

    return { ...meta, scope, version } as ModMeta;
}

export function getNamespace(meta: ModMeta) {
    const { scope, id } = meta;
    return `${scope}::${id}`;
}

async function buildCustomData({ scope, id }: { id: string; scope: string }, defaultData?: unknown) {
    if (defaultData) {
        let data;

        data = await endpoints.getModCustomData(scope, id);
        if (!data) {
            await endpoints.setModCustomData(scope, id, defaultData);
            data = defaultData;
        }

        const proxyData = createProxyObjectRef(data);

        const mutate = (recipe: (draft: unknown) => void) => {
            recipe(proxyData.ref);
            endpoints.setModCustomData(scope, id, proxyData.ref);
        };

        return { data: proxyData, mutate };
    }
    return {};
}

async function buildConfig(
    { scope, id }: { id: string; scope: string },
    configSchemas?: Record<string, SEAConfigSchema>
) {
    if (configSchemas) {
        let config;
        config = await endpoints.getModConfig(scope, id);
        if (!config) {
            const keys = Object.keys(configSchemas);
            const defaultConfig: Record<string, string | number | boolean> = {};
            keys.forEach((key) => {
                const item = configSchemas[key];
                switch (item.type) {
                    case 'textInput':
                        defaultConfig[key] = item.default ?? '';
                        break;
                    case 'numberInput':
                        defaultConfig[key] = item.default ?? 0;
                        break;
                    case 'select':
                        defaultConfig[key] = item.default ?? Object.values(item.list)[0];
                        break;
                    case 'checkbox':
                        defaultConfig[key] = item.default ?? false;
                        break;
                }
            });
            await endpoints.setModConfig(scope, id, defaultConfig);
            config = defaultConfig;
        }
        return { config, configSchemas };
    }
    return {};
}

export async function createModContext(options: CreateContextOptions<unknown, undefined>) {
    const ct = (...pets: string[]) => {
        const r = pets.map((pet) => ctStore.ctByName(pet));
        if (r.some((v) => v === undefined)) {
            throw new Error(`Pet ${pets} not found`);
        }
        return r as number[];
    };

    const battle = (name: string) => {
        const r = battleStore.get(name);
        if (!r) {
            throw new Error(`Battle ${name} not found`);
        }
        return r.battle();
    };

    const meta = buildMeta(options.meta);
    options.meta = meta;

    const logger = getLogger(meta.id);
    const data = await buildCustomData(meta, options.defaultData);
    const config = await buildConfig(meta, options.config);

    return { meta, logger, ct, battle, ...data, ...config } as ModContext<unknown, undefined>;
}
