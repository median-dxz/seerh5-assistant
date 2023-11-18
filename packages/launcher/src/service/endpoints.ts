import { BaseMod } from './ModManager/type';

type ModPathList = Array<{ path: string }>;

type AllMods = () => Promise<ModPathList>;
export const getAllMods: AllMods = async () => {
    return fetch('/api/mods').then((res) => res.json());
};

type ModConfig = (ns: string) => Promise<{ config?: unknown }>;
const getModConfig: ModConfig = async (ns: string) => {
    return fetch(`/api/mods/${ns}/config`).then((res) => {
        return res.json();
    });
};

const setModConfig = async (namespace: string, config: unknown) => {
    return fetch(`/api/mods/${namespace}/config`, {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const injectModConfig = async (mod: BaseMod) => {
    const { meta } = mod;
    const namespace = `${meta.type}::${meta.scope}::${meta.id}`;
    if (mod.defaultConfig) {
        const { config } = await getModConfig(namespace);
        if (config) {
            mod.config = config;
        } else {
            setModConfig(namespace, mod.defaultConfig);
            mod.config = mod.defaultConfig;
        }
    }
};

type CatchTime = (name?: string) => Promise<Array<[string, number]>>;
export const queryCatchTime: CatchTime = async (name) => {
    if (name) {
        return fetch(`/api/pet?name=${name}`).then((r) => r.json());
    } else {
        return fetch(`/api/pet`).then((r) => r.json());
    }
};

export const cacheCatchTime = async (data: Map<string, number>) => {
    return fetch(`/api/pet`, {
        method: 'POST',
        body: JSON.stringify([...data]),
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export interface PetFragmentOption {
    id: number;
    difficulty: number;
    sweep: boolean;
    battle: string[];
}

type PetFragmentConfig = () => Promise<PetFragmentOption[]>;
export const getPetFragmentConfig: PetFragmentConfig = async () => {
    return fetch(`/api/petFragmentLevel`).then((r) => r.json());
};
