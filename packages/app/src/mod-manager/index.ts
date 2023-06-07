import { injectModConfig } from '@sa-app/utils/saDataProvider';
import { BaseMod } from './mod-type';

export const Mods = new Map<string, BaseMod>();

export function register<T extends new () => BaseMod>(mod: T) {
    const modIns = new mod();
    
    if (modIns.defaultConfig) {
        modIns.config = injectModConfig(modIns.meta.id, modIns.defaultConfig);
    }

    console.log(`加载模组: ${modIns.meta.id}`);
    Mods.set(modIns.meta.id, modIns);
}
