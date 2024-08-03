import type { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/query';
import type { ApiRouter } from '@sea/server';
import { createTRPCClient, createWSClient, wsLink } from '@trpc/client';
import superjson from 'superjson';

const wsClient = createWSClient({
    url: `ws://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`
});

export const trpcClient = createTRPCClient<ApiRouter>({
    links: [wsLink({ client: wsClient, transformer: superjson })]
});

export const baseQuery: BaseQueryFn<(api: BaseQueryApi, options: unknown) => Promise<unknown>, unknown, Error> = async (
    queryFn,
    api,
    extraOptions
) => {
    try {
        return { data: await queryFn(api, extraOptions) };
    } catch (error) {
        return { error: error as Error };
    }
};

export const optionalTags = <T>(result: unknown, tags?: T[]): T[] => {
    if (!result || !tags) return [];
    return tags;
};
