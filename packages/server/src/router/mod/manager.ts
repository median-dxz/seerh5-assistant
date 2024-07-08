import path from 'path';

import { modIndexes, type ModState } from '../../data/ModIndexes.ts';
import { configsRoot, modsRoot } from '../../paths.ts';
import { SEASConfigData } from '../../shared/SEASConfigData.ts';
import { getNamespace } from '../../shared/index.ts';
import type { ModInstallOptions } from './schemas.ts';

export const ModManager = {
    root: '.',
    modData: new Map<string, SEASConfigData>(),
    modConfig: new Map<string, SEASConfigData>(),
    async init(root: string) {
        this.root = root;
        const mods = modIndexes.stateList();
        await Promise.all(mods.map(async ({ id, scope, state }) => this.load(scope, id, state)));
    },

    async saveData(scope: string, id: string, data: object) {
        const dataStore = this.modData.get(getNamespace(scope, id));
        if (!dataStore) {
            return {
                success: false
            };
        }
        await dataStore.mutate(() => data);
        return {
            success: true
        };
    },

    async data(scope: string, id: string) {
        const dataStore = this.modData.get(getNamespace(scope, id));
        if (!dataStore) {
            return undefined;
        }
        return Promise.resolve(dataStore.query());
    },

    async saveConfig(scope: string, id: string, data: object) {
        const configStore = this.modConfig.get(getNamespace(scope, id));
        if (!configStore) {
            return {
                success: false
            };
        }
        await configStore.mutate(() => data);
        return {
            success: true
        };
    },

    async config(scope: string, id: string) {
        const configStore = this.modConfig.get(getNamespace(scope, id));
        if (!configStore) {
            return undefined;
        }
        return Promise.resolve(configStore.query());
    },

    async install(scope: string, id: string, options: ModInstallOptions = {}) {
        if (modIndexes.state(scope, id) != undefined && !options.update) {
            return {
                success: false,
                reason: 'there has existed a mod with the same id and scope already'
            };
        }

        const state: ModState = {
            builtin: Boolean(options.builtin),
            preload: Boolean(options.preload),
            enable: true,
            requireConfig: Boolean(options.config),
            requireData: Boolean(options.data)
        };

        await modIndexes.set(scope, id, state);
        const ns = getNamespace(scope, id);

        // 在满足该模组请求数据存储的前提下:
        // 1. 当前数据存在但更新选项为false
        // 2. 当前数据不存在
        if (options.data && (!this.modData.has(ns) || options.update === false)) {
            const dataStore = new SEASConfigData();
            await dataStore.create(path.join(this.root, modsRoot, `${scope}.${id}.data.json`), options.data);
            this.modData.set(ns, dataStore);
        }
        if (options.config && (!this.modConfig.has(ns) || options.update === false)) {
            const configStore = new SEASConfigData();
            await configStore.create(
                path.join(this.root, configsRoot, modsRoot, `${scope}.${id}.json`),
                options.config
            );
            this.modConfig.set(ns, configStore);
        }

        return {
            success: true
        };
    },

    async load(scope: string, id: string, state: ModState) {
        const ns = getNamespace(scope, id);

        if (state.requireData) {
            const dataStore = new SEASConfigData();
            await dataStore.load(path.join(this.root, modsRoot, `${scope}.${id}.data.json`));
            this.modData.set(ns, dataStore);
        }
        if (state.requireConfig) {
            const configStore = new SEASConfigData();
            await configStore.load(path.join(this.root, configsRoot, modsRoot, `${scope}.${id}.json`));
            this.modConfig.set(ns, configStore);
        }
    },

    async uninstall() {
        return Promise.resolve({
            success: true
        });
    }
};
