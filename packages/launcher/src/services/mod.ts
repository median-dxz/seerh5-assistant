import { IS_DEV, MOD_BUILTIN_UPDATE_STRATEGY, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { buildDefaultConfig } from '@/shared';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { SEAModMetadata } from '@sea/mod-type';
import type { InstallModOptions } from '@sea/server';
import superjson from 'superjson';
import { baseQuery, optionalTags, trpcClient, type CommonResponse, type TRpcArgs, type TRpcResponse } from './base';

import type { ModFactory } from '@/features/mod/handler';
import { ModMetadataSchema } from '@/features/mod/schemas';
import type { ModDeployment, ModDeploymentInfo } from '@/features/mod/slice';
import { buildMetadata, prefetchModMetadata, type DefinedModMetadata } from '@/features/mod/utils';
import { praseCompositeId } from '@/shared/index';

const { modRouter } = trpcClient;

export const modApi = createApi({
    baseQuery,
    reducerPath: 'api/mod',
    tagTypes: ['Deployment', 'Data', 'Config'],
    endpoints: (build) => ({
        modList: build.query<Array<ModDeployment<'notDeployed'>>, void>({
            query: () => async () => {
                const list = await modRouter.modList.query();
                const result = list.map(({ cid, state }) => ({
                    ...praseCompositeId(cid),
                    state,
                    status: 'notDeployed' as const,
                    isDeploying: false
                }));
                return result;
            },
            providesTags: [{ type: 'Deployment', id: 'LIST' }]
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

        installBuiltin: build.mutation<CommonResponse[], void>({
            query: () => async () => {
                const builtinExports = await Promise.all([
                    import('@/builtin/builtin'),
                    import('@/builtin/petFragment')
                ]);

                const results: CommonResponse[] = await Promise.all(
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

                const failed = results.filter((r) => !r.success);
                if (failed.length > 0) {
                    throw new Error(`Failed to install builtin mods: [${failed.map((r) => r.reason).join(', ')}]`);
                }
            },
            invalidatesTags: [{ type: 'Deployment', id: 'LIST' }]
        }),

        install: build.mutation<CommonResponse, { url: string; update?: boolean }>({
            query:
                ({ url, update }) =>
                async () => {
                    update = update ?? false;
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
                        id,
                        scope
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
                    }).then((r) => r.json());
                },
            invalidatesTags: [{ type: 'Deployment', id: 'LIST' }]
        }),

        data: build.query<TRpcResponse<typeof modRouter.data.query>, TRpcArgs<typeof modRouter.data.query>>({
            query: (compositeId) => async () => modRouter.data.query(compositeId),
            providesTags: (r, e, cid) => optionalTags(r, [{ type: 'Data', id: cid } as const])
        }),

        setData: build.mutation<
            TRpcResponse<typeof modRouter.saveData.mutate>,
            TRpcArgs<typeof modRouter.saveData.mutate>
        >({
            query:
                ({ compositeId, data }) =>
                async () =>
                    modRouter.saveData.mutate({ compositeId, data }),
            // 乐观更新
            async onQueryStarted({ compositeId, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(modApi.util.updateQueryData('data', compositeId, () => data));
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(modApi.util.invalidateTags([{ type: 'Data', id: compositeId }]));
                }
            }
        }),

        config: build.query<TRpcResponse<typeof modRouter.config.query>, TRpcArgs<typeof modRouter.config.query>>({
            query: (compositeId) => async () => modRouter.config.query(compositeId),
            providesTags: (r, e, cid) => optionalTags(r, [{ type: 'Config', cid } as const])
        }),

        setConfig: build.mutation<
            TRpcResponse<typeof modRouter.setConfig.mutate>,
            TRpcArgs<typeof modRouter.setConfig.mutate>
        >({
            query:
                ({ compositeId, data }) =>
                async () =>
                    modRouter.setConfig.mutate({ compositeId, data }),
            invalidatesTags: (r, e, { compositeId }) => [{ type: 'Config', id: compositeId }]
        })
    })
});

// export const { endpoints } = modApi;
