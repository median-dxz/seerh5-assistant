import { getNamespace, praseNamespace } from '../utils.ts';
import { SEASDatabase } from './db.ts';

export interface ModState {
    enable: boolean;
    config: boolean;
    customData: boolean;
}

const initialModState: ModState = {
    enable: true,
    config: false,
    customData: false
} as const;

class ModList extends SEASDatabase<Record<string, ModState>> {
    constructor() {
        super({});
    }

    async getModList() {
        const data = await super.get();
        return Object.keys(data).map((ns) => {
            const { id, scope } = praseNamespace(ns);
            return { id, scope };
        });
    }

    async getModListWithState() {
        const data = await super.get();
        return Object.keys(data).map((ns) => {
            const { id, scope } = praseNamespace(ns);
            return { id, scope, state: data[ns] };
        });
    }

    async add(id: string, scope: string) {
        const ns = getNamespace(scope, id);
        const data = await super.get();
        data[ns] = initialModState;
        await super.save(data);
    }

    async remove(id: string, scope: string) {
        const ns = getNamespace(scope, id);
        const data = await super.get();
        delete data[ns];
        await super.save(data);
    }

    async setEnable(id: string, scope: string, enable: boolean) {
        const ns = getNamespace(scope, id);
        const data = await super.get();
        data[ns].enable = enable;
        await super.save(data);
    }

    async getState(id: string, scope: string) {
        const ns = getNamespace(scope, id);
        const data = await super.get();
        return data[ns];
    }
}

export const modList = new ModList();
