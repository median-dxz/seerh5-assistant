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
        configItem: build.query<unknown, RouterInput['configs']['item']['key']>({
            query: (key) => async (uid) => configs.item.query({ uid, key }),
            providesTags: (result, error, key) => optionalTags(result, [{ type: 'LauncherConfig' as const, id: key }])
        }),
        setConfigItem: build.mutation<void, Omit<RouterInput['configs']['setItem'], 'uid'>>({
            query: (arg) => async (uid) => configs.setItem.mutate({ uid, ...arg }),
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
        allTaskOptions: build.query<Record<string, object | undefined>, void>({
            query: () => async (uid) => taskOptions.all.query({ uid }),
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
        setTaskOptions: build.mutation<void, Omit<RouterInput['taskOptions']['set'], 'uid'>>({
            query:
                ({ taskId, data }) =>
                async (uid) =>
                    taskOptions.set.mutate({ uid, taskId, data }),
            async onQueryStarted({ taskId, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    launcherApi.util.updateQueryData('allTaskOptions', undefined, (draft) => {
                        draft[taskId] = data;
                    })
                );
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(launcherApi.util.invalidateTags([{ type: 'TaskOptions', id: taskId }]));
                }
            }
        })
    })
});
