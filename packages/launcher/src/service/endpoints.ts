type ModPathList = Array<{ path: string }>;

type AllMods = () => Promise<ModPathList>;
export const getAllMods: AllMods = async () => {
    return fetch('/api/mods').then((res) => res.json());
};

type ModConfig = (ns: string) => Promise<{ config?: unknown }>;
export const getModConfig: ModConfig = async (ns: string) => {
    return fetch(`/api/mods/${ns}/config`).then((res) => {
        return res.json();
    });
};

export const setModConfig = async (namespace: string, config: string) => {
    return fetch(`/api/mods/${namespace}/config`, {
        method: 'POST',
        body: config,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const setConfig = async (key: string, value: unknown) => {
    return fetch(`/api/launcher/config?key=${key}`, {
        method: 'POST',
        body: JSON.stringify(value),
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const getConfig = async (key: string) => {
    return fetch(`/api/launcher/config?key=${key}`)
        .then((res) => res.json())
        .then((data) => {
            if (JSON.stringify(data) === '{}') {
                return null;
            } else {
                return data;
            }
        });
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
