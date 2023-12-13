import fs from 'fs';
import path from 'path';
import * as superjson from 'superjson';

export let configRoot: string;

export const PetCache = {
    catchTimeMap: new Map<string, number>(),
    configPath: '',
    load(appRoot: string) {
        configRoot = path.join(appRoot, 'config');
        this.configPath = path.join(configRoot, 'sea-pet.json');
        if (!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, '{}');
        }
        const content = fs.readFileSync(this.configPath, 'utf-8');
        if (content != '{}') {
            this.catchTimeMap = superjson.parse(content);
        }
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
        const content = superjson.stringify(cacheObj);
        fs.writeFileSync(this.configPath, content);
    },
};
