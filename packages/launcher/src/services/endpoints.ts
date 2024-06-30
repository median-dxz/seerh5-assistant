import type { PetFragmentOptionRaw } from '@/builtin/petFragment/types';
import type { DataObject } from '@sea/mod-type';
import type { ApiRouter, ModInstallOptions } from '@sea/server';
import { createTRPCClient, createWSClient, wsLink } from '@trpc/client';
import superjson from 'superjson';

const wsClient = createWSClient({
    url: `ws://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`
});

const trpcClient = createTRPCClient<ApiRouter>({
    links: [wsLink({ client: wsClient, transformer: superjson })]
});

const { modRouter, configRouter } = trpcClient;

export const mod = {
    fetchList: async () => modRouter.modList.query(),
    data: async (scope: string, id: string) => modRouter.data.query({ scope, id }),
    setData: async (scope: string, id: string, data: DataObject) => modRouter.saveData.mutate({ scope, id, data }),
    config: async (scope: string, id: string) => modRouter.config.query({ scope, id }),
    setConfig: async (scope: string, id: string, data: DataObject) => modRouter.setConfig.mutate({ scope, id, data }),
    install: async (scope: string, id: string, options: ModInstallOptions) =>
        modRouter.install.mutate({ scope, id, options }),
    uploadAndInstall: async (scope: string, id: string, modUrl: string, options: ModInstallOptions) => {
        const modBlob = await fetch(modUrl).then((r) => r.blob());
        const modFile = new File([modBlob], `${scope}.${id}.js`, { type: 'text/javascript' });

        const data = new FormData();
        data.append('mod', modFile);
        data.append('options', JSON.stringify(options));

        const query = new URLSearchParams({
            id,
            scope
        });

        return fetch('/api/mods/install?' + query.toString(), {
            body: data,
            method: 'POST'
        }).then((r) => r.json());
    }
};

export type ConfigKey = 'PetGroups';
export const getConfig = async (key: ConfigKey) => configRouter.launcherConfig.query(key) as Promise<unknown>;

export const setConfig = async (key: ConfigKey, value: unknown) =>
    configRouter.setLauncherConfig.mutate({ key, value });

export async function queryCatchTime(name: string): Promise<[string, number]>;
export async function queryCatchTime(): Promise<Map<string, number>>;
export async function queryCatchTime(name?: string) {
    return configRouter.allCatchTime.query(name);
}

export const updateAllCatchTime = async (data: Map<string, number>) => configRouter.updateAllCatchTime.mutate(data);

export const deleteCatchTime = async (name: string) => configRouter.deleteCatchTime.mutate(name);

export const addCatchTime = async (name: string, time: number) => configRouter.setCatchTime.mutate([name, time]);

export const getPetFragmentConfig = async () =>
    configRouter.petFragmentLevel.query() as Promise<PetFragmentOptionRaw[]>;
