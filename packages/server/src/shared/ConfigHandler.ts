import type { Recipe } from '../client-types.ts';
import type { IStorage } from './utils.ts';

class DataNotLoadedError extends Error {
    constructor(public file: string) {
        super(`${file} hasn't been loaded yet`);
    }
}

export class ConfigHandler<TData extends object = object> {
    private data?: TData;
    constructor(private storage: IStorage) {}

    get loaded() {
        return this.data !== undefined;
    }

    async load(defaultData?: TData) {
        this.data = (await this.storage.load(defaultData)) as TData;
    }

    private async save() {
        if (!this.data) {
            throw new DataNotLoadedError(this.storage.source);
        }

        await this.storage.save(this.data);
    }

    async create(data: TData) {
        this.data = data;
        await this.save();
    }

    async mutate(recipe: Recipe<TData>) {
        if (!this.data) {
            throw new DataNotLoadedError(this.storage.source);
        }

        const r = recipe(this.data);
        r && (this.data = r);

        await this.save();
    }

    query() {
        if (!this.data) {
            throw new DataNotLoadedError(this.storage.source);
        }

        return this.data;
    }

    async destroy() {
        await this.storage.delete();
        this.data = undefined;
    }
}
