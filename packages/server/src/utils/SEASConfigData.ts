import fs from 'node:fs/promises';
import * as superjson from 'superjson';

export class SEASConfigData<TData extends NonNullable<object> = NonNullable<object>> {
    private configFile: string = '';
    private data?: TData;

    private get loaded() {
        return this.data != undefined && this.configFile !== '';
    }

    private async save() {
        const content = superjson.stringify(this.data);
        await fs.writeFile(this.configFile, content, { encoding: 'utf-8' });
    }

    async create(configFile: string, data: TData) {
        this.configFile = configFile;
        this.data = data;
        await this.save();
    }

    async loadWithDefault(configFile: string, defaultData: TData) {
        if (await testFileExist(configFile)) {
            await this.load(configFile);
        } else {
            await this.create(configFile, defaultData);
        }
    }

    async load(configFile: string) {
        this.configFile = configFile;
        if (await testFileExist(configFile)) {
            const content = await fs.readFile(configFile, {
                encoding: 'utf-8'
            });
            const config = superjson.parse(content);
            this.data = config as TData;
            return;
        }
        throw new Error(`Config file does not exist: ${configFile}`);
    }

    async mutate(recipe: (data: TData) => void | TData) {
        if (!this.loaded) {
            throw new Error("Data hasn't been loaded yet");
        }
        const r = recipe(this.data!);
        r && (this.data = r);

        await this.save();
    }

    query() {
        if (!this.loaded) {
            throw new Error("Data hasn't been loaded yet");
        }
        return this.data!;
    }

    async destroy() {
        if (!this.loaded) {
            throw new Error("Data hasn't been loaded yet");
        }
        await fs.rm(this.configFile);
        this.data = undefined;
        this.configFile = '';
    }
}

async function testFileExist(filePath: string) {
    try {
        const handle = await fs.open(filePath, 'r');
        await handle.close();
    } catch (error) {
        return false;
    }
    return true;
}
