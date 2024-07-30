import { SEASConfigHandler } from '../shared/SEASConfigHandler.ts';

export class PetCatchTime extends SEASConfigHandler<Map<string, number>> {
    async load() {
        return super.load(new Map());
    }

    async catchTime(name: string) {
        const data = super.query();
        return Promise.resolve(data.get(name));
    }

    async update(name: string, time: number) {
        await super.mutate((data) => {
            data.set(name, time);
        });
    }

    async delete(name: string) {
        await super.mutate((data) => {
            data.delete(name);
        });
    }
}
