import ModList from '../mods/modslist.json';

let RegisteredMods = new Map();

for (let mod of ModList) {
    register(mod.modId, mod.path);
}

async function register(id, path) {
    import(
        /* webpackChunkName: "modpack" */
        `../mods/${path}/${id}.js`
    ).then((ModClass) => {
        console.log(`[ModLoader]: 加载模组: ${id}`);
        RegisteredMods.set(id, new ModClass.default.mod());
    });
}

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(function () {
        for (let mod of ModList) {
            register(mod.modId, mod.path);
        }
    });
}

window.mods = RegisteredMods;
