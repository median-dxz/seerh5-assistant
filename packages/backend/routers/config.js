import fs from 'fs';
import path from 'path';
import * as toml from 'smol-toml';

import { base } from '../base.js';

export class ModConfig {
    /** @type { Record<string, Record<string, object>> | undefined } */
    data;

    type;
    id;
    author;
    /**
     * @param {string} ns
     */
    constructor(ns) {
        const { type, id, author } = praseNamespace(ns);
        this.type = type;
        this.id = id;
        this.author = author;

        const configFile = configFilePath(author);
        if (fs.existsSync(configFile)) {
            const content = fs.readFileSync(configFile, 'utf-8');
            /** @type {any} */
            const config = toml.parse(content);
            this.data = config;
        }
    }

    load() {
        return this.data?.[this.type]?.[this.id];
    }

    /**
     * @param { Record<string, any> } data
     */
    save(data) {
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

/**
 * @param {string} ns
 * @returns {{type: string, author: string, id: string}}
 */
function praseNamespace(ns) {
    const [type, author, id] = ns.split('::');
    return {
        type,
        author,
        id,
    };
}

/**
 * @param {string} filename
 */
function configFilePath(filename) {
    return path.join(base, 'config', `${filename}.toml`);
}
