import { createApi } from '@reduxjs/toolkit/query/react';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import type { SEAModMetadata } from '@sea/mod-type';
import type { ApiRouter, InstallModOptions } from '@sea/server';

import { IS_DEV, MOD_BUILTIN_UPDATE_STRATEGY, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { DefinedModMetadata, ModDeploymentInfo, ModFactory } from '@/features/mod';
import { buildMetadata, ModMetadataSchema, prefetchModMetadata } from '@/features/mod/utils'; // 阻止循环导入
import { buildDefaultConfig, getCompositeId, praseCompositeId } from '@/shared';

import { baseQuery, optionalTags, trpcClient } from '../shared';

type RouterInput = inferRouterInputs<ApiRouter>['modRouter'];
type RouterOutput = inferRouterOutputs<ApiRouter>['modRouter'];
const { modRouter } = trpcClient;

export const modApi = createApi({
    baseQuery,
    reducerPath: 'api/mod',
    tagTypes: ['Index', 'Data', 'Config'],
    endpoints: (build) => ({
        indexList: build.query<ModDeploymentInfo[], void>({
            query: () => async () => {
                const list = await modRouter.indexList.query();
                const result = list.map(({ cid, state }) => ({
                    ...praseCompositeId(cid),
                    state
                }));
                return result;
            },
            providesTags: [{ type: 'Index', id: 'LIST' }]
        }),

        fetch: build.query<{ factory: ModFactory; metadata: DefinedModMetadata }, ModDeploymentInfo>({
            query:
                ({ id, scope, state }) =>
                async () => {
                    if (state.builtin) {
                        switch (id) {
                            case 'Builtin':
                                return import('@/builtin/builtin').then(({ default: factory, metadata }) => ({
                                    factory: factory as ModFactory,
                                    metadata: buildMetadata(metadata)
                                }));

                            case 'PetFragmentLevel':
                                return import('@/builtin/petFragment').then(({ default: factory, metadata }) => ({
                                    factory: factory as ModFactory,
                                    metadata: buildMetadata(metadata)
                                }));

                            default:
                                throw new Error(`Unknown builtin mod: ${id}`);
                        }
                    } else {
                        const params = new URLSearchParams({ version: state.version });
                        if (IS_DEV) {
                            params.append('r', Math.random().toString());
                        }
                        return import(/* @vite-ignore */ `/mods/${scope}.${id}.js?${params.toString()}`).then(
                            ({ default: factory, metadata }: { default: ModFactory; metadata: SEAModMetadata }) => ({
                                factory,
                                metadata: buildMetadata(metadata)
                            })
                        );
                    }
                }
        }),

        installBuiltin: build.mutation<string[], void>({
            query: () => async () => {
                const builtinExports = await Promise.all([
                    import('@/builtin/builtin'),
                    import('@/builtin/petFragment')
                ]);

                return await Promise.all(
                    builtinExports.map(async (exports) => {
                        const metadata = ModMetadataSchema.parse(exports.metadata) as SEAModMetadata;
                        const options: InstallModOptions = {
                            builtin: true,
                            version: VERSION,
                            preload: metadata.preload,
                            config: metadata.configSchema && buildDefaultConfig(metadata.configSchema),
                            data: metadata.data,
                            update: MOD_BUILTIN_UPDATE_STRATEGY === 'always'
                        };
                        return modRouter.install.mutate({ scope: MOD_SCOPE_BUILTIN, id: metadata.id, options });
                    })
                );
            },
            invalidatesTags: [{ type: 'Index', id: 'LIST' }]
        }),

        install: build.mutation<string, { url: string; update?: boolean }>({
            query:
                ({ url, update = false }) =>
                async () => {
                    const metadata = await prefetchModMetadata(url);

                    const options: InstallModOptions = {
                        builtin: false,
                        preload: metadata.preload,
                        version: metadata.version,
                        config: metadata.configSchema && buildDefaultConfig(metadata.configSchema),
                        data: metadata.data,
                        update
                    };

                    const { scope, id } = metadata;

                    const modBlob = await fetch(url).then((r) => r.blob());
                    const modFile = new File([modBlob], `${scope}.${id}.js`, { type: 'text/javascript' });

                    const query = new URLSearchParams({
                        cid: getCompositeId({ id, scope })
                    });

                    let modSerializedData: string | undefined = undefined;
                    if (options.data !== undefined) {
                        modSerializedData = superjson.stringify(options.data);
                    }

                    const data = new FormData();
                    data.append(
                        'options',
                        new Blob([JSON.stringify({ ...options, data: modSerializedData })], {
                            type: 'application/json'
                        })
                    );
                    data.append('mod', new File([modFile], `${scope}.${id}.js`, { type: 'text/javascript' }));

                    return fetch(`/api/mods/install?` + query.toString(), {
                        body: data,
                        method: 'POST'
                    }).then(async (r) => {
                        const parsedResponse = await r.json();
                        if (!r.ok) {
                            const errorResponse = {
                                ...parsedResponse,
                                message: JSON.parse((parsedResponse as { message: string }).message)
                            };
                            throw errorResponse;
                        } else {
                            return (parsedResponse as { result: string }).result;
                        }
                    });
                },
            invalidatesTags: [{ type: 'Index', id: 'LIST' }]
        }),

        data: build.query<object, RouterInput['data']>({
            query: (compositeId) => async () => modRouter.data.query(compositeId),
            providesTags: (r, e, cid) => optionalTags(r, [{ type: 'Data', id: cid } as const])
        }),

        setData: build.mutation<RouterOutput['setData'], RouterInput['setData']>({
            query:
                ({ compositeId, data }) =>
                async () =>
                    modRouter.setData.mutate({ compositeId, data }),
            invalidatesTags: (r, e, { compositeId }) => [{ type: 'Data', id: compositeId }]
        }),

        config: build.query<object, RouterInput['config']>({
            query: (compositeId) => async () => modRouter.config.query(compositeId),
            providesTags: (r, e, cid) => optionalTags(r, [{ type: 'Config', cid } as const])
        }),

        setConfig: build.mutation<RouterOutput['setConfig'], RouterInput['setConfig']>({
            query:
                ({ compositeId, data }) =>
                async () =>
                    modRouter.setConfig.mutate({ compositeId, data }),
            invalidatesTags: (r, e, { compositeId }) => [{ type: 'Config', id: compositeId }]
        }),

        uninstall: build.mutation<void, RouterInput['uninstall']>({
            query: (compositeId) => async () => modRouter.uninstall.mutate(compositeId),
            invalidatesTags: [{ type: 'Index', id: 'LIST' }]
        })
    })
});
