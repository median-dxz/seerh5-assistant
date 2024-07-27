import { z } from 'zod';
import { SEASConfigHandler } from '../shared/SEASConfigHandler.ts';

export const LauncherConfigKeys = ['PetGroups'] as const;

export const PetGroupsSchema = z.array(z.array(z.number())).length(7);

const defaultConfig: {
    PetGroups: z.infer<typeof PetGroupsSchema>;
} = {
    PetGroups: [[], [], [], [], [], [], []]
};

export type LauncherConfigType = typeof defaultConfig;

export class LauncherConfig extends SEASConfigHandler<LauncherConfigType> {
    async load() {
        return super.load(defaultConfig);
    }

    async item<TKey extends keyof LauncherConfigType>(key: TKey) {
        const data = super.query();
        return Promise.resolve(data[key]);
    }

    async setItem<TKey extends keyof LauncherConfigType>(key: TKey, value: LauncherConfigType[TKey]) {
        await super.mutate((data) => {
            data[key] = value;
        });
    }
}
