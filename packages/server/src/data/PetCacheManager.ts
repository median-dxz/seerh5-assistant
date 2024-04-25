import { SEASDatabase } from './db.ts';

class PetCatchTimeMap extends SEASDatabase<Map<string, number>> {
    constructor() {
        super(new Map());
    }

    async getCatchTime(name: string) {
        const data = await super.get();
        return data.get(name);
    }

    async updateCatchTime(name: string, time: number) {
        const data = await super.get();
        data.set(name, time);
        await super.save(data);
    }

    async deleteCatchTime(name: string) {
        const data = await super.get();
        data.delete(name);
        await super.save(data);
    }
}

export const petCatchTimeMap = new PetCatchTimeMap();
