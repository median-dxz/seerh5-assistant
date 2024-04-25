import fs from 'node:fs/promises';
import * as superjson from 'superjson';

export abstract class SEASDatabase<TData> {
    #configFile: string = '';

    set configFile(configFile: string) {
        this.#configFile = configFile;
    }

    get configFile() {
        return this.#configFile;
    }

    public async save(data: TData) {
        if (!this.configFile) throw new Error('configFile is not defined');

        const content = superjson.stringify(data);
        await fs.writeFile(this.configFile, content, { encoding: 'utf-8' });
    }

    public async get() {
        if (!this.configFile) {
            return this.defaultData;
        }
        if (await testFileExist(this.configFile)) {
            const content = await fs.readFile(this.configFile, {
                encoding: 'utf-8'
            });
            const config = superjson.parse(content);
            return config as TData;
        } else {
            return this.defaultData;
        }
    }

    constructor(private defaultData: TData) {}
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
