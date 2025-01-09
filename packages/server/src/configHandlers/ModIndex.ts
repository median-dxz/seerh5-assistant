import { ConfigHandler } from '../shared/ConfigHandler.ts';

export interface ModState {
    enable: boolean;
    requireConfig: boolean;
    requireData: boolean;
    builtin: boolean;
    preload: boolean;
    version: string;
}

export class ModIndex extends ConfigHandler<Map<string, ModState>> {
    async load() {
        return super.load(new Map());
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
