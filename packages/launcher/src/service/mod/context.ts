import { MOD_SCOPE_DEFAULT } from '@/constants';
import * as endpoints from '@/service/endpoints';
import * as ctStore from '@/service/store/CatchTimeBinding';
import { store as battleStore } from '@/service/store/battle';
import { CommonLogger, LogStyle } from '@/utils/logger';

type ProxyObjectRef<T extends object> = T & { ref: T };
type Meta = SEAL.Meta;
type CreateContextOptions = SEAL.CreateContextOptions<unknown>;

function createProxyObjectRef<T extends object>(initValue: T) {
    const observable = {
        ref: initValue,
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
        },
    });

    return proxy;
}

const getLogger = (id: string) => CommonLogger(id, 'info', LogStyle.mod);

export function buildMeta(meta: Partial<Meta>) {
    let { scope, version } = meta;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.0.0';

    return { ...meta, scope, version } as Meta;
}

export function getNamespace(meta: Meta) {
    const { scope, id } = meta;
    return `${scope}::${id}`;
}

async function buildConfig({ scope, id }: { id: string; scope: string }, defaultConfig?: unknown) {
    if (defaultConfig) {
        let config;

        config = await endpoints.getModConfig(scope, id);
        if (!config) {
            await endpoints.setModConfig(scope, id, defaultConfig);
            config = defaultConfig;
        }

        const proxyConfig = createProxyObjectRef(config);

        const mutate = (recipe: (draft: unknown) => void) => {
            recipe(proxyConfig.ref);
            endpoints.setModConfig(scope, id, proxyConfig.ref);
        };

        return { config: proxyConfig, mutate };
    }
    return {};
}

export async function createModContext(options: CreateContextOptions) {
    const ct = (...pets: string[]) => {
        return pets.map((pet) => ctStore.ctByName(pet));
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
    const config = await buildConfig(meta, options.defaultConfig);

    return { meta, logger, ct, battle, ...config } as SEAL.ModContext<unknown>;
}
