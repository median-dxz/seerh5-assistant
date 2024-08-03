import { z } from 'zod';

import { buildMetadata } from '@sea/mod-resolver';
import type { SEAModMetadata } from '@sea/mod-type';
import type { ModState } from '@sea/server';

export interface ModExportsRef {
    deploymentId: string;
    cid: string;
    key: string;
}

export interface ModDeploymentInfo {
    id: string;
    scope: string;
    state: ModState;
}

export type ModDeploymentStatus = 'notDeployed' | 'deployed';
export type ModDeployment<T extends ModDeploymentStatus = ModDeploymentStatus> = T extends 'deployed'
    ? ModDeploymentInfo & {
          status: T;
          deploymentId: string;
          isDeploying: false;
      }
    : ModDeploymentInfo & { status: T; isDeploying: boolean };

const ConfigItemSchema = z
    .object({ name: z.string(), helperText: z.string().optional() })
    .and(
        z.union([
            z.object({ type: z.literal('input'), default: z.string() }),
            z.object({ type: z.literal('select'), default: z.string(), list: z.record(z.string()) }),
            z.object({ type: z.literal('checkbox'), default: z.boolean() }),
            z.object({ type: z.literal('battle'), default: z.string() })
        ])
    );

const DateObjectSchema = z.custom<object>(
    (data) =>
        data !== null &&
        typeof data === 'object' &&
        (Object.getPrototypeOf(data) === Object.prototype ||
            Array.isArray(data) ||
            data instanceof Set ||
            data instanceof Map)
);

export const ModMetadataSchema = z.object({
    id: z.string(),
    scope: z.string().optional(),
    version: z.string().optional(),
    description: z.string().optional(),
    preload: z.boolean().optional(),
    data: DateObjectSchema.optional(),
    configSchema: z.record(ConfigItemSchema).optional()
});

export async function prefetchModMetadata(url: string) {
    const modImport = (await import(/* @vite-ignore */ url)) as { metadata: SEAModMetadata };
    const { metadata } = modImport;
    ModMetadataSchema.parse(metadata);
    return buildMetadata(metadata);
}
