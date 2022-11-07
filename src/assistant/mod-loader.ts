import { defaultStyle, SaModuleLogger } from '../logger';
import ModList from '../mods/modslist.json';
const log = SaModuleLogger('ModLoader', defaultStyle.mod);

export class ReflectObjBase {
    [key: string]: any;

    constructor() {}

    reflect(method: string, ...args: any[]) {
        return this[method]?.(args);
    }

    getKeys(): Array<string> {
        return Object.keys(Object.getOwnPropertyDescriptors(this.__proto__)).filter(
            (key) => !key.startsWith('_') && key !== 'constructor'
        );
    }
}

export type Mod = ReflectObjBase & ModClass;

let RegisteredMods = new Map<string, Mod>();

for (let mod of ModList) {
    register(mod.modId, mod.path);
}

async function register(id: string, path: string) {
    import(
        /* webpackChunkName: "modpack" */
        `../mods/${path}/${id}`
    ).then((ModClass) => {
        log(`加载模组: ${id}`);
        RegisteredMods.set(id, new ModClass.default.mod());
    });
}

window.SAMods = RegisteredMods;
