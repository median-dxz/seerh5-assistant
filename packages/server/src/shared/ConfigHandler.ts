import type { Recipe } from '../client-types.ts';
import type { IStorage } from './utils.ts';

class DataNotLoadedError extends Error {
    constructor(public file: string) {
        super(`${file} hasn't been loaded yet`);
    }
}

export class ConfigHandler<TConfig extends object = object> {
    private config?: TConfig;
    constructor(private storage: IStorage) {}

    get loaded() {
        return this.config !== undefined;
    }

    async load(defaultConfig: undefined, override?: false): Promise<void>;
    async load(defaultConfig: TConfig, override?: boolean): Promise<void>;
    async load(defaultConfig?: TConfig, override = false): Promise<void> {
        if (override) {
            await this.create(defaultConfig!);
        } else {
            if (this.loaded) return;

            if (defaultConfig === undefined) {
                throw new Error('Default data must be provided when loading for the first time');
            }

            this.config = (await this.storage.load(defaultConfig)) as TConfig;
        }
    }

    async create(config: TConfig) {
        this.config = config!;
        await this.save();
    }

    private async save() {
        if (!this.config) {
            throw new DataNotLoadedError(this.storage.source);
        }

        await this.storage.save(this.config);
    }

    async mutate(recipe: Recipe<TConfig>) {
        if (!this.config) {
            throw new DataNotLoadedError(this.storage.source);
        }

        const r = recipe(this.config);
        r && (this.config = r);

        await this.save();
    }

    query() {
        if (!this.config) {
            throw new DataNotLoadedError(this.storage.source);
        }

        return this.config;
    }

    async destroy() {
        await this.storage.delete();
        this.config = undefined;
    }
}
