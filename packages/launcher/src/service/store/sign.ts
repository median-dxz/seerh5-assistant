export interface SignInstance extends SEAL.Sign {
    ownerMod: string;
}

export const store = new Map<string, SignInstance>();

export function add(mod: string, _sign: SEAL.Sign) {
    const instance: SignInstance = {
        ..._sign,
        ownerMod: mod,
    };
    store.set(_sign.name, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
