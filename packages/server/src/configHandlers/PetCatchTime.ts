import { MultiUserConfigHandler } from '../shared/MultiUserConfigHandler.ts';

export class PetCatchTime extends MultiUserConfigHandler<Map<string, number>> {
    async load() {
        return super.loadWithDefaultConfig(new Map());
    }

    async catchTime(uid: string, name: string) {
        const data = super.query(uid);
        return Promise.resolve(data.get(name));
    }

    async update(uid: string, name: string, time: number) {
        await super.mutate(uid, (data) => {
            data.set(name, time);
        });
    }

    async delete(uid: string, name: string) {
        await super.mutate(uid, (data) => {
            data.delete(name);
        });
    }
}
