import { QueryKeys } from '@/constants';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery, optionalTags, trpcClient, type TRpcArgs } from './endpointsBase';

const { configRouter } = trpcClient;

export const configApi = createApi({
    baseQuery,
    reducerPath: 'api/config',
    tagTypes: ['TaskConfig'],
    endpoints: (build) => ({
        allTaskConfig: build.query<Record<string, object | undefined>, TRpcArgs<typeof configRouter.task.all.query>>({
            query: () => async () => configRouter.task.all.query(),
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
                            id: QueryKeys.taskConfig(key)
                        }))
                )
        })
    })
});

// export const { endpoints } = configApi;
