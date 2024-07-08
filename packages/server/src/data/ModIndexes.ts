import { SEASConfigData } from '../shared/SEASConfigData.ts';
import { getNamespace, praseNamespace } from '../shared/index.ts';

export interface ModState {
    enable: boolean;
    requireConfig: boolean;
    requireData: boolean;
    builtin: boolean;
    preload: boolean;
}

const initialModState: ModState = {
    enable: true,
    requireConfig: false,
    requireData: false,
    builtin: false,
    preload: false
} as const;

class ModIndexes extends SEASConfigData<Map<string, ModState>> {
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, new Map());
    }

    stateList() {
        const data = super.query();
        return Array.from(data.entries()).map(([ns, state]) => {
            const { id, scope } = praseNamespace(ns);
            return { id, scope, state };
        });
    }

    async set(scope: string, id: string, state?: ModState) {
        state = state ?? { ...initialModState };
        const ns = getNamespace(scope, id);
        await super.mutate((data) => {
            data.set(ns, state);
        });
    }

    async remove(scope: string, id: string) {
        const ns = getNamespace(scope, id);
        await super.mutate((data) => {
            data.delete(ns);
        });
    }

    state(scope: string, id: string) {
        const ns = getNamespace(scope, id);
        return super.query().get(ns);
    }
}

export const modIndexes = new ModIndexes();
