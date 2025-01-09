import type { Recipe } from '../client-types.ts';
import { ConfigHandler } from './ConfigHandler.ts';
import type { IStorage } from './utils.ts';

export class MultiUserConfigHandler<TData extends object = object> {
    private configHandler: ConfigHandler<Record<string, TData>>;
    constructor(storage: IStorage) {
        this.configHandler = new ConfigHandler(storage);
    }

    async load(defaultData?: TData) {
        await this.configHandler.load(defaultData !== undefined ? { default: defaultData } : undefined);
    }

    async create(data: TData) {
        await this.configHandler.create({ default: data });
    }

    async mutate(uid: string, recipe: Recipe<TData>) {
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
