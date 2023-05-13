import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('ModLoader', defaultStyle.mod);

import { BaseMod } from './mod-type';

export const Mods = new Map<string, BaseMod>();

export function register<T extends new () => BaseMod>(mod: T) {
    const modIns = new mod();
    log(`加载模组: ${modIns.meta.id}`);
    Mods.set(modIns.meta.id, modIns);
}

export * from './mod-type';

