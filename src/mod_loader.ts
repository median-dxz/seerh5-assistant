import { defaultStyle, SaModuleLogger } from './assistant/logger';
import { Mod } from './assistant/mod-type';
import ModList from './mods/modslist.json';
const log = SaModuleLogger('ModLoader', defaultStyle.mod);

let RegisteredMods = new Map<string, Mod>();

for (let mod of ModList) {
    register(mod.modId, mod.path);
}

async function register(id: string, path: string) {
    import(
        /* webpackChunkName: "modpack" */
        `./mods/${path}/${id}`
    ).then((ModClass) => {
        log(`加载模组: ${id}`);
        RegisteredMods.set(id, new ModClass.default.mod());
    });
}

window.SAMods = RegisteredMods;
