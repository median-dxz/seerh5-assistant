import type { Recipe } from '../client-types.ts';
import { ConfigHandler } from './ConfigHandler.ts';
import type { IStorage } from './utils.ts';

export class MultiUserConfigHandler<TConfig extends object = object> {
    private configHandler: ConfigHandler<Record<string, TConfig>>;
    constructor(storage: IStorage) {
        this.configHandler = new ConfigHandler(storage);
    }

    async loadWithDefaultConfig(config: TConfig, override = false) {
        const multiUserDefaultConfig = { default: config };
        await this.configHandler.load(multiUserDefaultConfig, override);
    }

    async mutate(uid: string, recipe: Recipe<TConfig>) {
        await this.configHandler.mutate((userDataMap) => {
            let data = userDataMap[uid];
            if (data === undefined) {
                data = structuredClone(userDataMap['default']);
                userDataMap[uid] = data;
            }

            const r = recipe(data);
            r && (userDataMap[uid] = r);
        });
    }

    query(uid: string) {
        const userDataMap = this.configHandler.query();
        const data = userDataMap[uid];
        if (data !== undefined) {
            return data;
        } else {
            return userDataMap['default'];
        }
    }

    queryAll() {
        return this.configHandler.query();
    }

    async destroy() {
        await this.configHandler.destroy();
    }
}
