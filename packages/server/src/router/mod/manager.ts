import path from 'path';

import { modIndexes, type ModState } from '../../data/ModIndexes.ts';
import { configsRoot, modsRoot } from '../../paths.ts';
import { getCompositeId, praseCompositeId } from '../../shared/index.ts';
import { SEASConfigData } from '../../shared/SEASConfigData.ts';
import type { InstallModOptions } from './schemas.ts';

const failed = (reason?: string) => ({
    success: false,
    reason
});

const succeed = () => ({ success: true });

export const ModManager = {
    root: '.',
    modData: new Map<string, SEASConfigData>(),
    modConfig: new Map<string, SEASConfigData>(),
    async init(root: string) {
        this.root = root;
        const mods = modIndexes.stateList();
        await Promise.all(
            mods.map(async ({ cid, state }) => {
                const { id, scope } = praseCompositeId(cid);
                return this.load(scope, id, state);
            })
        );
    },

    async saveData(id: string, data: object) {
        const dataStore = this.modData.get(id);
        if (!dataStore) return failed('data store not found');

        await dataStore.mutate(() => data);
        return succeed();
    },

    async data(cid: string) {
        const dataStore = this.modData.get(cid);
        if (!dataStore) {
            return undefined;
        }
        return Promise.resolve(dataStore.query());
    },

    async saveConfig(cid: string, data: object) {
        const configStore = this.modConfig.get(cid);
        if (!configStore) return failed('config store not found');

        await configStore.mutate(() => data);
        return succeed();
    },

    async config(cid: string) {
        const configStore = this.modConfig.get(cid);
        if (!configStore) {
            return undefined;
        }
        return Promise.resolve(configStore.query());
    },

    async install(cid: string, options: InstallModOptions) {
        if (modIndexes.state(cid) != undefined && !options.update)
            return failed('there has existed a mod with the same id and scope already');

        const state: ModState = {
            builtin: Boolean(options.builtin),
            preload: Boolean(options.preload),
            enable: true,
            version: options.version,
            requireConfig: Boolean(options.config),
            requireData: Boolean(options.data)
        };

        await modIndexes.set(cid, state);
        const { id, scope } = praseCompositeId(cid);

        // 在满足该模组请求数据存储的前提下:
        // 1. 当前数据存在但更新选项为false
        // 2. 当前数据不存在
        if (options.data && (!this.modData.has(cid) || options.update === false)) {
            const dataStore = new SEASConfigData();
            await dataStore.create(path.join(this.root, modsRoot, `${scope}.${id}.data.json`), options.data);
            this.modData.set(cid, dataStore);
        }
        if (options.config && (!this.modConfig.has(cid) || options.update === false)) {
            const configStore = new SEASConfigData();
            await configStore.create(
                path.join(this.root, configsRoot, modsRoot, `${scope}.${id}.json`),
                options.config
            );
            this.modConfig.set(cid, configStore);
        }

        return succeed();
    },

    async load(scope: string, id: string, state: ModState) {
        const cid = getCompositeId(scope, id);

        if (state.requireData) {
            const dataStore = new SEASConfigData();
            await dataStore.load(path.join(this.root, modsRoot, `${scope}.${id}.data.json`));
            this.modData.set(cid, dataStore);
        }
        if (state.requireConfig) {
            const configStore = new SEASConfigData();
            await configStore.load(path.join(this.root, configsRoot, modsRoot, `${scope}.${id}.json`));
            this.modConfig.set(cid, configStore);
        }
    },

    async setEnable(cid: string, enable: boolean) {
        const state = modIndexes.state(cid);
        if (!state) {
            return failed('mod not found');
        }
        state.enable = enable;
        await modIndexes.set(cid, state);
        return succeed();
    },

    async uninstall() {
        return Promise.resolve({
            success: true
        });
    }
};
