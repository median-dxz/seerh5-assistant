import type { SEAFormItemSchema, SEAModMetadata } from '@sea/mod-type';
import { MOD_SCOPE_DEFAULT } from './constants.ts';

export const praseCompositeId = (cid: string) => {
    const [scope, id] = cid.split('::');
    return {
        scope: scope.replaceAll('/:/', ':'),
        id: id.replaceAll('/:/', ':')
    };
};

export function getCompositeId({ id, scope }: Pick<DefinedModMetadata, 'id' | 'scope'>) {
    scope = scope.replaceAll(':', '/:/');
    id = id.replaceAll(':', '/:/');
    return `${scope}::${id}`;
}

export type DefinedModMetadata = Required<Omit<SEAModMetadata, 'configSchema' | 'data'>> &
    Pick<SEAModMetadata, 'configSchema' | 'data'>;

export function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload, description } = metadata;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.1.0';
    preload = preload ?? false;
    description = description ?? '';

    return { ...metadata, scope, version, preload, description } as DefinedModMetadata;
}

export function buildDefaultConfig(configSchema: Record<string, SEAFormItemSchema | undefined>) {
    const keys = Object.keys(configSchema);
    const defaultConfig: Record<string, string | number | boolean> = {};
    keys.forEach((key) => {
        const item = configSchema[key]!;
        defaultConfig[key] = item.default;
    });
    return defaultConfig;
}

export * from './constants.ts';
