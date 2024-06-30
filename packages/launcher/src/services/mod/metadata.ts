import { MOD_SCOPE_DEFAULT } from '@/constants';
import type { SEAConfigItemSchema, SEAModMetadata } from '@sea/mod-type';

export function getNamespace(meta: SEAModMetadata) {
    const { scope, id } = meta;
    return `${scope}::${id}`;
}

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

export function buildDefaultConfig(configSchema: Record<string, SEAConfigItemSchema>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key];
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}
