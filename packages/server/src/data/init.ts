import path from 'node:path';
import { configsRoot } from '../paths.ts';
import { launcherConfig } from './LauncherConfig.ts';
import { modIndexes } from './ModIndexes.ts';
import { petCatchTimeMap } from './PetCacheManager.ts';
import { taskConfig } from './TaskConfig.ts';

const PET_CACHE_FILENAME = 'sea-pets.json';
const MOD_LIST_FILENAME = 'sea-mods.json';
const LAUNCHER_CONFIG_FILENAME = 'sea-launcher.json';
const TASK_CONFIG_FILENAME = 'sea-task-config.json';

export const initConfigs = async (appRoot: string) => {
    await Promise.all([
        petCatchTimeMap.loadWithDefault(path.join(appRoot, configsRoot, PET_CACHE_FILENAME)),
        launcherConfig.loadWithDefault(path.join(appRoot, configsRoot, LAUNCHER_CONFIG_FILENAME)),
        modIndexes.loadWithDefault(path.join(appRoot, configsRoot, MOD_LIST_FILENAME)),
        taskConfig.loadWithDefault(path.join(appRoot, configsRoot, TASK_CONFIG_FILENAME))
    ]);
};
