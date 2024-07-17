import { trpcClient } from './endpointsBase';

const { configRouter } = trpcClient;

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
