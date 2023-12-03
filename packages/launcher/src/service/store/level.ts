export interface LevelInstance {
    id: string;
    name: string;
    level: SEAL.Level;
    ownerMod: string;
}

export const store = new Map<string, LevelInstance>();

export function add(mod: string, level: SEAL.Level) {
    const name = level.meta.name;
    const id = level.meta.id;

    const instance: LevelInstance = {
        level,
        id,
        name,
        ownerMod: mod,
    };
    store.set(id, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
