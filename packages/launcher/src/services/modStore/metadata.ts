import { MOD_SCOPE_DEFAULT } from '@/constants';
import type { SEAModMetadata } from '@sea/mod-type';

export type DefinedModMetadata = Required<Omit<SEAModMetadata, 'configSchema' | 'data'>> &
    Pick<SEAModMetadata, 'configSchema' | 'data'>;

export function getNamespace(meta: SEAModMetadata) {
    const { scope, id } = meta;
    return `${scope ?? MOD_SCOPE_DEFAULT}::${id}`;
}

export function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload, description } = metadata;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.0.0';
    preload = preload ?? false;
    description = description ?? '';

    return { ...metadata, scope, version, preload, description } as DefinedModMetadata;
}
