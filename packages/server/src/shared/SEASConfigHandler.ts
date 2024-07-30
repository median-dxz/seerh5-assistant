import type { Recipe } from '../client-types.ts';

export interface IStorage {
    source: string;
    load(defaultData?: object): Promise<object>;
    save(data: object): Promise<void>;
    delete(): Promise<void>;
}

class DateNotLoadedError extends Error {
    constructor(public file: string) {
        super(`${file} hasn't been loaded yet`);
    }
}

export class SEASConfigHandler<TData extends object = object> {
    private data?: TData;
    constructor(private storage: IStorage) {}

    get loaded() {
        return this.data !== undefined;
    }

    async load(defaultData?: TData) {
        this.data = (await this.storage.load(defaultData)) as TData;
    }

    async create(data: TData) {
        this.data = data;
        await this.save();
    }

    private async save() {
        if (!this.data) {
            throw new DateNotLoadedError(this.storage.source);
        }

        await this.storage.save(this.data);
    }

    async mutate(recipe: Recipe<TData>) {
        if (!this.data) {
            throw new DateNotLoadedError(this.storage.source);
        }

        const r = recipe(this.data);
        r && (this.data = r);

        await this.save();
    }

    query() {
        if (!this.data) {
            throw new DateNotLoadedError(this.storage.source);
        }

        return this.data;
    }

    async destroy() {
        await this.storage.delete();
        this.data = undefined;
    }
}
