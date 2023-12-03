import fs from 'fs';
import path from 'path';
import * as toml from 'smol-toml';
import { configRoot } from './PetCacheManager.ts';

import superjson, { type SuperJSONResult } from 'superjson';

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
            const config = superjson.deserialize(toml.parse(content) as unknown as SuperJSONResult);
            this.data = config as typeof this.data;
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

        const content = toml.stringify(superjson.serialize(this.data));
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
