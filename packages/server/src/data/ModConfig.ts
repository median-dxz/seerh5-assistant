import fs from 'fs';
import path from 'path';
import * as toml from 'smol-toml';
import { configRoot } from './PetCacheManager.ts';

export class ModConfig {
    data: Record<string, Record<string, object>> | undefined;

    id;
    author;

    constructor(ns: string) {
        const { id, author } = praseNamespace(ns);

        this.id = id;
        this.author = author;

        const configFile = configFilePath(author);
        if (fs.existsSync(configFile)) {
            const content = fs.readFileSync(configFile, 'utf-8');
            const config: any = toml.parse(content);
            this.data = config;
        }
    }

    load() {
        return this.data?.[this.id];
    }

    save(data: Record<string, any>) {
        this.data = {
            ...this.data,
            [this.id]: {
                ...data,
            },
        };
        const content = toml.stringify(this.data);
        console.log(content, this.data);
        fs.writeFileSync(configFilePath(this.author), content);
    }
}

function praseNamespace(ns: string): { author: string; id: string } {
    const [author, id] = ns.split('::');
    return {
        author,
        id,
    };
}

function configFilePath(filename: string) {
    return path.join(configRoot, `${filename}.toml`);
}
