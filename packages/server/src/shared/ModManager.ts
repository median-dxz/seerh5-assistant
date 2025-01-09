import type { ModIndex, ModState } from '../configHandlers/ModIndex.js';
import type { InstallModOptions } from '../router/mod/schemas.js';
import { MultiUserConfigHandler } from './MultiUserConfigHandler.ts';
import type { IStorage } from './utils.js';

export class ModManager {
    configHandlers = new Map<string, MultiUserConfigHandler>();
    dataHandlers = new Map<string, MultiUserConfigHandler>();

    constructor(
        public index: ModIndex,
        private configStorageBuilder: (cid: string) => IStorage,
        private dataStorageBuilder: (cid: string) => IStorage
    ) {}

    async init() {
        const mods = this.index.stateList();
        await Promise.all(mods.map(async ({ cid, state }) => this.load(cid, state)));
    }

    async saveData(uid: string, cid: string, data: object) {
        const dataHandler = this.dataHandlers.get(cid);
        if (!dataHandler) throw new Error('data store not found');

        await dataHandler.mutate(uid, () => data);
    }

    async data(uid: string, cid: string) {
        const dataHandler = this.dataHandlers.get(cid);
        if (!dataHandler) {
            return undefined;
        }
        return Promise.resolve(dataHandler.query(uid));
    }

    async saveConfig(uid: string, cid: string, data: object) {
        const configHandler = this.configHandlers.get(cid);
        if (!configHandler) throw new Error('config store not found');

        await configHandler.mutate(uid, () => data);
    }

    async config(uid: string, cid: string) {
        const configHandler = this.configHandlers.get(cid);
        if (!configHandler) {
            return undefined;
        }
        return Promise.resolve(configHandler.query(uid));
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

        // 在满足该模组请求数据持久化的前提下:
        // 1. 当前数据存在但更新选项为false
        // 2. 当前数据不存在
        //
        // 此时将创建新的数据持久化对象, 覆盖原对象
        if (options.config && (!this.configHandlers.has(cid) || options.update === false)) {
            const handler = new MultiUserConfigHandler(this.configStorageBuilder(cid));
            await handler.create(options.config);
            this.configHandlers.set(cid, handler);
        }

        if (options.data && (!this.dataHandlers.has(cid) || options.update === false)) {
            const handler = new MultiUserConfigHandler(this.dataStorageBuilder(cid));
            await handler.create(options.data);
            this.dataHandlers.set(cid, handler);
        }

        return cid;
    }

    async load(cid: string, state: ModState) {
        if (state.requireConfig) {
            const handler = new MultiUserConfigHandler(this.configStorageBuilder(cid));
            await handler.load();
            this.configHandlers.set(cid, handler);
        }

        if (state.requireData) {
            const handler = new MultiUserConfigHandler(this.dataStorageBuilder(cid));
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
