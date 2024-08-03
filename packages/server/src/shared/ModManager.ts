import type { ModIndex, ModState } from '../configHandlers/ModIndex.js';
import type { InstallModOptions } from '../router/mod/schemas.js';
import { SEASConfigHandler } from './SEASConfigHandler.js';
import type { IStorage } from './utils.js';

export class ModManager {
    configHandlers = new Map<string, SEASConfigHandler>();
    dataHandlers = new Map<string, SEASConfigHandler>();

    constructor(
        public index: ModIndex,
        private configStorageBuilder: (cid: string) => IStorage,
        private dataStorageBuilder: (cid: string) => IStorage
    ) {}

    async init() {
        const mods = this.index.stateList();
        await Promise.all(mods.map(async ({ cid, state }) => this.load(cid, state)));
    }

    async saveData(cid: string, data: object) {
        const dataStore = this.dataHandlers.get(cid);
        if (!dataStore) throw new Error('data store not found');

        await dataStore.mutate(() => data);
    }

    async data(cid: string) {
        const dataStore = this.dataHandlers.get(cid);
        if (!dataStore) {
            return undefined;
        }
        return Promise.resolve(dataStore.query());
    }

    async saveConfig(cid: string, data: object) {
        const configStore = this.configHandlers.get(cid);
        if (!configStore) throw new Error('config store not found');

        await configStore.mutate(() => data);
    }

    async config(cid: string) {
        const configStore = this.configHandlers.get(cid);
        if (!configStore) {
            return undefined;
        }
        return Promise.resolve(configStore.query());
    }

    async install(cid: string, options: InstallModOptions) {
        if (this.index.state(cid) != undefined && !options.update)
            throw new Error('there has existed a mod with the same id and scope already');

        const state: ModState = {
            builtin: Boolean(options.builtin),
            preload: Boolean(options.preload),
            enable: true,
            version: options.version,
            requireConfig: Boolean(options.config),
            requireData: Boolean(options.data)
        };

        await this.index.set(cid, state);

        // 在满足该模组请求数据存储的前提下:
        // 1. 当前数据存在但更新选项为false
        // 2. 当前数据不存在
        if (options.config && (!this.configHandlers.has(cid) || options.update === false)) {
            const handler = new SEASConfigHandler(this.configStorageBuilder(cid));
            await handler.create(options.config);
            this.configHandlers.set(cid, handler);
        }

        if (options.data && (!this.dataHandlers.has(cid) || options.update === false)) {
            const handler = new SEASConfigHandler(this.dataStorageBuilder(cid));
            await handler.create(options.data);
            this.dataHandlers.set(cid, handler);
        }

        return cid;
    }

    async load(cid: string, state: ModState) {
        if (state.requireConfig) {
            const handler = new SEASConfigHandler(this.configStorageBuilder(cid));
            await handler.load();
            this.configHandlers.set(cid, handler);
        }

        if (state.requireData) {
            const handler = new SEASConfigHandler(this.dataStorageBuilder(cid));
            await handler.load();
            this.dataHandlers.set(cid, handler);
        }
    }

    async setEnable(cid: string, enable: boolean) {
        const state = this.index.state(cid);
        if (!state) {
            return new Error('mod not found');
        }
        state.enable = enable;
        await this.index.set(cid, state);
    }

    async uninstall(cid: string) {
        // 清除数据
        await Promise.all(
            [this.configHandlers.get(cid), this.dataHandlers.get(cid)].map((handler) => handler?.destroy())
        );
        this.configHandlers.delete(cid);
        this.dataHandlers.delete(cid);

        // 删除索引
        await this.index.remove(cid);
    }
}
