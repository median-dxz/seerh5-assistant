import path from 'path';
import { modList } from '../../data/ModList.ts';
import { SEASDatabase } from '../../data/db.ts';
import { configsRoot, modsRoot } from '../../paths.ts';
import { getNamespace } from '../../utils.ts';

export class ModCustomData extends SEASDatabase<unknown> {
    constructor(
        appRoot: string,
        public scope: string,
        public id: string
    ) {
        super({});
        this.configFile = path.join(appRoot, modsRoot, scope, id, `${id}.json`);
    }
}

export class ModConfig extends SEASDatabase<unknown> {
    constructor(
        appRoot: string,
        public scope: string,
        public id: string
    ) {
        super({});
        this.configFile = path.join(appRoot, configsRoot, scope, `${id}.json`);
    }
}

export const ModManager = {
    root: '.',
    modData: new Map<string, ModCustomData>(),
    modConfig: new Map<string, unknown>(),
    async init(root: string) {
        this.root = root;
        const mods = await modList.getModListWithState();
        mods.filter(({ state: { customData } }) => customData).forEach(({ id, scope }) => {
            this.modData.set(getNamespace(scope, id), new ModCustomData(this.root, scope, id));
        });
    },
    async saveCustomData(scope: string, id: string, data: unknown) {
        const mod = this.modData.get(getNamespace(scope, id));
        if (!mod) {
            return {
                success: false
            };
        }
        await mod.save(data);
        return {
            success: true
        };
    },
    async customData(scope: string, id: string) {
        const mod = this.modData.get(getNamespace(scope, id));
        if (!mod) {
            return undefined;
        }
        return mod.get();
    },
    async saveConfig(scope: string, id: string, data: unknown) {
        this.modConfig.set(getNamespace(scope, id), data);
        return {
            success: true
        };
    },
    async config(scope: string, id: string) {
        return this.modConfig.get(getNamespace(scope, id));
    },
    async install() {
        return {
            success: true
        };
    },
    async uninstall() {
        return {
            success: true
        };
    }
};
