import path from 'node:path';
import { configsRoot } from '../paths.ts';
import { launcherConfig } from './LauncherConfig.ts';
import { modList } from './ModList.ts';
import { petCatchTimeMap } from './PetCacheManager.ts';
import { petFragmentLevel } from './PetFragmentLevel.ts';

const PET_CACHE_FILENAME = 'sea-pets.json';
const MOD_LIST_FILENAME = 'sea-mods.json';
const LAUNCHER_CONFIG_FILENAME = 'sea-launcher.json';
const PET_FRAGMENT_LEVEL_FILENAME = 'sea-pet-fragment-level.json';

export const initConfigs = (appRoot: string) => {
    petCatchTimeMap.configFile = path.join(appRoot, configsRoot, PET_CACHE_FILENAME);
    modList.configFile = path.join(appRoot, configsRoot, MOD_LIST_FILENAME);
    launcherConfig.configFile = path.join(appRoot, configsRoot, LAUNCHER_CONFIG_FILENAME);
    petFragmentLevel.configFile = path.join(appRoot, configsRoot, PET_FRAGMENT_LEVEL_FILENAME);
};
