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

export const { task } = configRouter;

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
    }
};

export type ConfigKey = 'PetGroups';
export const getConfig = async (key: ConfigKey) => configRouter.launcher.item.query(key) as Promise<unknown>;

export const setConfig = async (key: ConfigKey, value: unknown) => configRouter.launcher.setItem.mutate({ key, value });

export async function queryCatchTime(name: string): Promise<[string, number]>;
export async function queryCatchTime(): Promise<Map<string, number>>;
export async function queryCatchTime(name?: string) {
    return configRouter.catchTime.all.query(name);
}
export const updateAllCatchTime = async (data: Map<string, number>) => configRouter.catchTime.mutate.mutate(data);

export const deleteCatchTime = async (name: string) => configRouter.catchTime.delete.mutate(name);

export const addCatchTime = async (name: string, time: number) => configRouter.catchTime.set.mutate([name, time]);
