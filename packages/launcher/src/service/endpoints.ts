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

const { modRouter, configRouter } = trpcClient;

export type ModInfo = { id: string; scope: string };
export const getAllModList = async (): Promise<Array<ModInfo>> => {
    return modRouter.modList.query();
};

export const getModCustomData = async (scope: string, id: string) => {
    return modRouter.customData.query({ scope, id });
};

export const setModCustomData = async (scope: string, id: string, data: unknown) => {
    return modRouter.saveCustomData.mutate({ scope, id, data });
};

export const getModConfig = async (scope: string, id: string) => {
    return modRouter.config.query({ scope, id });
};

export const setModConfig = async (scope: string, id: string, data: unknown) => {
    return modRouter.setConfig.mutate({ scope, id, data });
};

export type ConfigKey = 'PetGroups';
export const getConfig = async (key: ConfigKey) => {
    return configRouter.launcherConfig.query(key) as Promise<unknown>;
};

export const setConfig = async (key: ConfigKey, value: unknown) => {
    return configRouter.setLauncherConfig.mutate({ key, value });
};

export async function queryCatchTime(name: string): Promise<[string, number]>;
export async function queryCatchTime(): Promise<Map<string, number>>;
export async function queryCatchTime(name?: string) {
    return configRouter.allCatchTime.query(name);
}

export const updateAllCatchTime = async (data: Map<string, number>) => {
    return configRouter.updateAllCatchTime.mutate(data);
};

export const deleteCatchTime = async (name: string) => {
    return configRouter.deleteCatchTime.mutate(name);
};

export const addCatchTime = async (name: string, time: number) => {
    return configRouter.setCatchTime.mutate([name, time]);
};

export const getPetFragmentConfig = async () => {
    return configRouter.petFragmentLevel.query() as Promise<PetFragmentOptionRaw[]>;
};
