import type { PetFragmentOptionRaw } from '@/views/Automation/PetFragmentLevel';
import type { ApiRouter } from '@sea/server';
import { createTRPCClient, createWSClient, wsLink } from '@trpc/client';
import superjson from 'superjson';

const wsClient = createWSClient({
    url: `ws://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`
});

const trpcClient = createTRPCClient<ApiRouter>({
    links: [wsLink({ client: wsClient, transformer: superjson })]
});

export type ModPathList = Array<{ path: string }>;

type AllMods = () => Promise<ModPathList>;
export const getAllMods: AllMods = async () => {
    return trpcClient.allMods.query();
};

export const getModConfig = async (scope: string, id: string) => {
    return trpcClient.modConfig.query({ scope, id });
};

export const setModConfig = async (scope: string, id: string, config: unknown) => {
    return trpcClient.setModConfig.mutate({ scope, id, config });
};

export const getConfig = async (key: string) => {
    return trpcClient.launcherConfig.query(key) as Promise<unknown>;
};

export const setConfig = async (key: string, value: unknown) => {
    return trpcClient.setLauncherConfig.mutate({ key, value });
};

export async function queryCatchTime(name: string): Promise<[string, number]>;
export async function queryCatchTime(): Promise<Map<string, number>>;
export async function queryCatchTime(name?: string) {
    return trpcClient.pets.query(name);
}

export const cacheCatchTime = async (data: Map<string, number>) => {
    return trpcClient.cachePets.mutate(data);
};

export const deleteCatchTime = async (name: string) => {
    return trpcClient.removeCachePet.mutate(name);
};

export const addCatchTime = async (name: string, time: number) => {
    return trpcClient.addCachePet.mutate([name, time]);
};

export const getPetFragmentConfig = async () => {
    return trpcClient.petFragmentLevel.query() as Promise<PetFragmentOptionRaw[]>;
};
