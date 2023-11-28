/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'fs';
import path from 'path';
import * as toml from 'smol-toml';

import { basePath } from '../../config.ts';

export const PetCache = {
    configPath: path.join(basePath, 'config', 'sea-pet.toml'),
    catchTimeMap: new Map(),
    load() {
        if (!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, '');
        }
        const content = fs.readFileSync(this.configPath, 'utf-8');

        const config: any = toml.parse(content);
        Object.keys(config).forEach((key) => this.catchTimeMap.set(key, config[key]));
    },

    query(name: string) {
        return this.catchTimeMap.get(name);
    },

    update(newData: Map<string, number>) {
        this.catchTimeMap = newData;
        const cacheObj: Record<string, number> = {};
        for (const [key, value] of newData.entries()) {
            cacheObj[key] = value;
        }
        const content = toml.stringify(cacheObj);
        fs.writeFileSync(this.configPath, content);
    },
};

PetCache.load();

export class ModConfig {
    data: Record<string, Record<string, object>> | undefined;

    type;
    id;
    author;

    constructor(ns: string) {
        const { type, id, author } = praseNamespace(ns);
        this.type = type;
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
        return this.data?.[this.type]?.[this.id];
    }

    save(data: Record<string, any>) {
        this.data = {
            ...this.data,
            [this.type]: {
                ...this.data?.[this.type],
                [this.id]: {
                    ...data,
                },
            },
        };
        const content = toml.stringify(this.data);
        console.log(content, this.data);
        fs.writeFileSync(configFilePath(this.author), content);
    }
}

function praseNamespace(ns: string): { type: string; author: string; id: string } {
    const [type, author, id] = ns.split('::');
    return {
        type,
        author,
        id,
    };
}

function configFilePath(filename: string) {
    return path.join(basePath, 'config', `${filename}.toml`);
}
