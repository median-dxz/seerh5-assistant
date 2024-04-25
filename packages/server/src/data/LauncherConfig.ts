import { z } from 'zod';
import { SEASDatabase } from './db.ts';

export const LauncherConfigKeys = ['PetGroups'] as const;

export const PetGroupsSchema = z.array(z.array(z.number()));

const defaultConfig = {
    PetGroups: [] as z.infer<typeof PetGroupsSchema>
} as const;

export type LauncherConfigType = typeof defaultConfig;

class LauncherConfig extends SEASDatabase<LauncherConfigType> {
    constructor() {
        super(defaultConfig);
    }

    async getItem<TKey extends keyof LauncherConfigType>(key: TKey) {
        const data = await super.get();
        return data[key];
    }

    async setItem<TKey extends keyof LauncherConfigType>(key: TKey, value: LauncherConfigType[TKey]) {
        const data = await super.get();
        data[key] = value;
        await super.save(data);
    }
}

export const launcherConfig = new LauncherConfig();
