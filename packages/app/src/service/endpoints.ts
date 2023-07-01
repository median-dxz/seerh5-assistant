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
    const namespace = `${meta.type}::${meta.author}::${meta.id}`;
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
