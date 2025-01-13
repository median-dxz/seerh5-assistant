import { z } from 'zod';
import { MultiUserConfigHandler } from '../shared/MultiUserConfigHandler.ts';

export const LauncherConfigKeys = ['PetGroups'] as const;

export const PetGroupsSchema = z.array(z.array(z.number())).length(7);

const defaultConfig: {
    PetGroups: z.infer<typeof PetGroupsSchema>;
} = {
    PetGroups: [[], [], [], [], [], [], []]
};

export type LauncherConfigType = typeof defaultConfig;

export class LauncherConfig extends MultiUserConfigHandler<LauncherConfigType> {
    async load() {
        return super.loadWithDefaultConfig(defaultConfig);
    }

    async item<TKey extends keyof LauncherConfigType>(uid: string, key: TKey) {
        const data = super.query(uid);
        return Promise.resolve(data[key]);
    }

    async setItem<TKey extends keyof LauncherConfigType>(uid: string, key: TKey, value: LauncherConfigType[TKey]) {
        await super.mutate(uid, (data) => {
            data[key] = value;
        });
    }
}
