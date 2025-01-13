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
            config: options.config ?? null,
            data: options.data ?? null
        };

        await this.index.set(cid, state);

        // update 含义为配置兼容性, 为 true 时说明兼容旧配置, 不需要进行覆盖
        await this.load(cid, state, !options.update);

        return cid;
    }

    async load(cid: string, state: ModState, override = false) {
        if (state.config) {
            if (this.configHandlers.has(cid)) {
                const handler = this.configHandlers.get(cid)!;
                await handler.loadWithDefaultConfig(state.config, override);
            } else {
                const handler = new MultiUserConfigHandler(this.configStorageBuilder(cid));
                await handler.loadWithDefaultConfig(state.config, override);
                this.configHandlers.set(cid, handler);
            }
        }

        if (state.data) {
            if (this.dataHandlers.has(cid)) {
                const handler = this.dataHandlers.get(cid)!;
                await handler.loadWithDefaultConfig(state.data, override);
            } else {
                const handler = new MultiUserConfigHandler(this.dataStorageBuilder(cid));
                await handler.loadWithDefaultConfig(state.data, override);
                this.dataHandlers.set(cid, handler);
            }
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
