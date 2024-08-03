import { createApi } from '@reduxjs/toolkit/query/react';
import type { inferRouterInputs } from '@trpc/server';

import type { ApiRouter } from '@sea/server';

import { baseQuery, optionalTags, trpcClient } from '../shared';

const {
    launcherRouter: { taskOptions, configs }
} = trpcClient;

type RouterInput = inferRouterInputs<ApiRouter>['launcherRouter'];

export const launcherApi = createApi({
    baseQuery,
    reducerPath: 'api/launcher',
    tagTypes: ['TaskOptions', 'LauncherConfig'],
    endpoints: (build) => ({
        configItem: build.query<unknown, RouterInput['configs']['item']>({
            query: (key) => async () => configs.item.query(key),
            providesTags: (result, error, key) => optionalTags(result, [{ type: 'LauncherConfig' as const, id: key }])
        }),
        setConfigItem: build.mutation<void, RouterInput['configs']['setItem']>({
            query:
                ({ key, value }) =>
                async () =>
                    configs.setItem.mutate({ key, value }),
            async onQueryStarted({ key, value }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(launcherApi.util.updateQueryData('configItem', key, () => value));
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(launcherApi.util.invalidateTags([{ type: 'LauncherConfig', id: key }]));
                }
            }
        }),
        allTaskOptions: build.query<Record<string, object | undefined>, RouterInput['taskOptions']['all']>({
            query: () => async () => taskOptions.all.query(),
            transformResponse(response: Map<string, object>) {
                const result: Record<string, object | undefined> = {};
                for (const [k, v] of response.entries()) {
                    result[k] = v;
                }
                return result;
            },
            providesTags: (result) =>
                optionalTags(
                    result,
                    result &&
                        Object.keys(result).map((key) => ({
                            type: 'TaskOptions',
                            id: key
                        }))
                )
        }),
        setTaskOptions: build.mutation<void, RouterInput['taskOptions']['set']>({
            query:
                ({ id, data }) =>
                async () =>
                    taskOptions.set.mutate({ id, data }),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    launcherApi.util.updateQueryData('allTaskOptions', undefined, (draft) => {
                        draft[id] = data;
                    })
                );
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(launcherApi.util.invalidateTags([{ type: 'TaskOptions', id }]));
                }
            }
        })
    })
});
