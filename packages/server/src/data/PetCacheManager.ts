import { SEASConfigData } from '../shared/SEASConfigData.ts';

class PetCatchTimeMap extends SEASConfigData<Map<string, number>> {
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, new Map());
    }

    async catchTime(name: string) {
        const data = super.query();
        return Promise.resolve(data.get(name));
    }

    async updateCatchTime(name: string, time: number) {
        await super.mutate((data) => {
            data.set(name, time);
        });
    }

    async deleteCatchTime(name: string) {
        await super.mutate((data) => {
            data.delete(name);
        });
    }
}

export const petCatchTimeMap = new PetCatchTimeMap();
