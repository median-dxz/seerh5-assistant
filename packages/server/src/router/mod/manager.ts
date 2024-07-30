import type { ModIndex, ModState } from '../../configHandlers/ModIndex.ts';
import { SEASConfigHandler, type IStorage } from '../../shared/SEASConfigHandler.ts';
import type { InstallModOptions } from './schemas.ts';

const failed = (reason?: string) => ({
    success: false,
    reason
});

const succeed = () => ({ success: true });

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
        if (!dataStore) return failed('data store not found');

        await dataStore.mutate(() => data);
        return succeed();
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
        if (!configStore) return failed('config store not found');

        await configStore.mutate(() => data);
        return succeed();
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
            return failed('there has existed a mod with the same id and scope already');

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

        return succeed();
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
            return failed('mod not found');
        }
        state.enable = enable;
        await this.index.set(cid, state);
        return succeed();
    }

    async uninstall(_cid: string) {
        // TODO implement
        return Promise.resolve({
            success: true
        });
    }
}
