import { defaultStyle, SaModuleLogger } from '../logger';
import { Mod } from './mod-type';
const log = SaModuleLogger('ModLoader', defaultStyle.mod);

let RegisteredMods = new Map<string, Mod>();

async function register(id: string, mod: typeof Mod) {
    log(`加载模组: ${id}`);
    RegisteredMods.set(id, new mod());
}

sac.Mods = RegisteredMods;

export * from "./mod-type";
export { register };
export { Mod };


