import { defaultStyle, SaModuleLogger } from '../logger';
import { Mod } from './mod-type';
const log = SaModuleLogger('ModLoader', defaultStyle.mod);

let RegisteredMods = new Map<string, Mod>();

async function register<T extends new () => Mod>(mod: T) {
    const modIns = new mod();
    log(`加载模组: ${modIns.meta.id}`);
    RegisteredMods.set(modIns.meta.id, modIns);
}

export * from './mod-type';
export { register, RegisteredMods };

