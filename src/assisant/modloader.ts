import ModList from '../mods/modslist.json';

let RegisteredMods = new Map();

for (let mod of ModList) {
    register(mod.modId, mod.path);
}

async function register(id: string, path: string) {
    import(
        /* webpackChunkName: "modpack" */
        `../mods/${path}/${id}`
    ).then((ModClass) => {
        console.log(`[ModLoader]: 加载模组: ${id}`);
        RegisteredMods.set(id, new ModClass.default.mod());
    });
}

window.SaMods = RegisteredMods;
