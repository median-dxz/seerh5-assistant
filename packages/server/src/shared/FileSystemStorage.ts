import fs from 'node:fs/promises';
import * as superjson from 'superjson';
import type { IStorage } from './utils.ts';

export class FileSystemStorage implements IStorage {
    constructor(public file = '') {}

    get source() {
        return this.file;
    }

    async load(defaultData?: object) {
        const { file } = this;
        if (await testFileExist(file)) {
            const content = await fs.readFile(file, { encoding: 'utf-8' });
            return superjson.parse<object>(content);
        } else if (defaultData) {
            await this.save(defaultData);
            return defaultData;
        }

        throw new Error(`Config file load failed, with no default data provided: ${file}`);
    }

    async save(data: object) {
        const content = superjson.stringify(data);
        return fs.writeFile(this.file, content, { encoding: 'utf-8' });
    }

    async delete() {
        return fs.rm(this.file);
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
