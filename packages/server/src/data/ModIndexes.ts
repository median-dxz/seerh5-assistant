import { SEASConfigData } from '../shared/SEASConfigData.ts';

export interface ModState {
    enable: boolean;
    requireConfig: boolean;
    requireData: boolean;
    builtin: boolean;
    preload: boolean;
    version: string;
}

class ModIndexes extends SEASConfigData<Map<string, ModState>> {
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, new Map());
    }

    stateList() {
        const data = super.query();
        return Array.from(data.entries()).map(([cid, state]) => ({ cid, state }));
    }

    async set(cid: string, state: ModState) {
        await super.mutate((data) => {
            data.set(cid, { ...state });
        });
    }

    async remove(cid: string) {
        await super.mutate((data) => {
            data.delete(cid);
        });
    }

    state(cid: string) {
        return super.query().get(cid);
    }
}

export const modIndexes = new ModIndexes();
