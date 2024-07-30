import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery, optionalTags, trpcClient, type TRpcArgs } from './base';

const { dataRouter } = trpcClient;

export const dataApi = createApi({
    baseQuery,
    reducerPath: 'api/data',
    tagTypes: ['TaskConfig', 'LauncherConfig'],
    endpoints: (build) => ({
        launcherConfigItem: build.query<unknown, TRpcArgs<typeof dataRouter.launcher.item.query>>({
            query: (key) => async () => dataRouter.launcher.item.query(key),
            providesTags: (result, error, key) => optionalTags(result, [{ type: 'LauncherConfig' as const, id: key }])
        }),
        setLauncherConfigItem: build.mutation<void, TRpcArgs<typeof dataRouter.launcher.setItem.mutate>>({
            query:
                ({ key, value }) =>
                async () =>
                    dataRouter.launcher.setItem.mutate({ key, value }),
            async onQueryStarted({ key, value }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(dataApi.util.updateQueryData('launcherConfigItem', key, () => value));
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(dataApi.util.invalidateTags([{ type: 'LauncherConfig', id: key }]));
                }
            }
        }),
        allTaskConfig: build.query<Record<string, object | undefined>, TRpcArgs<typeof dataRouter.task.all.query>>({
            query: () => async () => dataRouter.task.all.query(),
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
                            type: 'TaskConfig',
                            id: key
                        }))
                )
        }),
        setTaskOptions: build.mutation<void, TRpcArgs<typeof dataRouter.task.set.mutate>>({
            query:
                ({ id, data }) =>
                async () =>
                    dataRouter.task.set.mutate({ id, data }),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    dataApi.util.updateQueryData('allTaskConfig', undefined, (draft) => {
                        draft[id] = data;
                    })
                );
                try {
                    await queryFulfilled;
                } catch (e) {
                    patchResult.undo();
                    dispatch(dataApi.util.invalidateTags([{ type: 'TaskConfig', id }]));
                }
            }
        })
    })
});
