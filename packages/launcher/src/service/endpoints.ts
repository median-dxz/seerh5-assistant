import type { ApiRouter } from '@sea/server';
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import superjson from 'superjson';

const wsClient = createWSClient({
    url: `ws://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`,
});

const trpcClient = createTRPCProxyClient<ApiRouter>({
    links: [wsLink({ client: wsClient })],
    transformer: superjson,
});

type ModPathList = Array<{ path: string }>;

type AllMods = () => Promise<ModPathList>;
export const getAllMods: AllMods = async () => {
    return trpcClient.allMods.query();
};

type ModConfig = (ns: string) => Promise<{ config?: unknown }>;
export const getModConfig: ModConfig = async (ns: string) => {
    return trpcClient.modConfig.query(ns);
};

export const setModConfig = async (namespace: string, config: string) => {
    return trpcClient.setModConfig.mutate({ namespace, config });
};

export const getConfig = async (key: string) => {
    return trpcClient.launcherConfig.query(key) as Promise<{ dsl: string[][]; snm: string[][] } | null>;
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

export interface PetFragmentOption {
    id: number;
    difficulty: number;
    sweep: boolean;
    battle: string[];
}

export const getPetFragmentConfig = async () => {
    return trpcClient.petFragmentLevel.query() as Promise<PetFragmentOption[]>;
};
