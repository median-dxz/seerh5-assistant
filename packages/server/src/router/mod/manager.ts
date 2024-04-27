import path from 'path';
import { modList } from '../../data/ModList.ts';
import { SEASDatabase } from '../../data/db.ts';
import { configsRoot, modsRoot } from '../../paths.ts';
import { getNamespace } from '../../utils.ts';

export class ModCustomData extends SEASDatabase<unknown> {
    constructor(
        appRoot: string,
        public scope: string,
        public id: string
    ) {
        super({});
        this.configFile = path.join(appRoot, modsRoot, scope, id, `${id}.json`);
    }
}

export class ModConfig extends SEASDatabase<unknown> {
    constructor(
        appRoot: string,
        public scope: string,
        public id: string
    ) {
        super({});
        this.configFile = path.join(appRoot, configsRoot, scope, `${id}.json`);
    }
}

export const ModManager = {
    root: '.',
    modData: new Map<string, ModCustomData>(),
    modConfig: new Map<string, ModConfig>(),
    async init(root: string) {
        this.root = root;
        const mods = await modList.getModListWithState();
        mods.forEach(({ id, scope, state }) => {
            if (state.requireData) {
                this.modData.set(getNamespace(scope, id), new ModCustomData(this.root, scope, id));
            }
            if (state.requireConfig) {
                this.modConfig.set(getNamespace(scope, id), new ModConfig(this.root, scope, id));
            }
        });
    },
    async saveCustomData(scope: string, id: string, data: unknown) {
        const dataStore = this.modData.get(getNamespace(scope, id));
        if (!dataStore) {
            return {
                success: false
            };
        }
        await dataStore.save(data);
        return {
            success: true
        };
    },
    async customData(scope: string, id: string) {
        const dataStore = this.modData.get(getNamespace(scope, id));
        if (!dataStore) {
            return undefined;
        }
        return dataStore.get();
    },
    async saveConfig(scope: string, id: string, data: unknown) {
        const configStore = this.modConfig.get(getNamespace(scope, id));
        if (!configStore) {
            return {
                success: false
            };
        }
        await configStore.save(data);
        return {
            success: true
        };
    },
    async config(scope: string, id: string) {
        const configStore = this.modConfig.get(getNamespace(scope, id));
        if (!configStore) {
            return undefined;
        }
        return configStore.get();
    },
    async install() {
        return {
            success: true
        };
    },
    async uninstall() {
        return {
            success: true
        };
    }
};
