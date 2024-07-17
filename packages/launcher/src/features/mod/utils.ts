import { MOD_SCOPE_DEFAULT } from '@/constants';
import type { SEAModMetadata } from '@sea/mod-type';
import { ModMetadataSchema } from './schemas';

export interface ModExportsRef {
    deploymentId: string;
    modScope: string;
    modId: string;
    key: string;
}

export type DefinedModMetadata = Required<Omit<SEAModMetadata, 'configSchema' | 'data'>> &
    Pick<SEAModMetadata, 'configSchema' | 'data'>;

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

export function buildMetadata(metadata: SEAModMetadata) {
    let { scope, version, preload, description } = metadata;

    scope = scope ?? MOD_SCOPE_DEFAULT;
    version = version ?? '0.0.1';
    preload = preload ?? false;
    description = description ?? '';

    return { ...metadata, scope, version, preload, description } as DefinedModMetadata;
}

export async function prefetchModMetadata(url: string) {
    const modImport = (await import(/* @vite-ignore */ url)) as { metadata: SEAModMetadata };
    const { metadata } = modImport;
    ModMetadataSchema.parse(metadata);
    return buildMetadata(metadata);
}
