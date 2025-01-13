import path from 'node:path';
import { configsRoot } from '../paths.ts';
import { FileSystemStorage } from '../shared/FileSystemStorage.ts';

import { LauncherConfig } from '../configHandlers/LauncherConfig.ts';
import { ModIndex } from '../configHandlers/ModIndex.ts';
import { PetCatchTime } from '../configHandlers/PetCatchTime.ts';
import { TaskOptions } from '../configHandlers/TaskOptions.ts';

const PET_CACHE_FILENAME = 'sea-pets.json';
const MOD_LIST_FILENAME = 'sea-mods.json';
const LAUNCHER_CONFIG_FILENAME = 'sea-launcher.json';
const TASK_OPTIONS_FILENAME = 'sea-task-options.json';

export const setupConfigHandlers = async (appRoot: string) => {
    const petCatchTimeStorage = new FileSystemStorage(path.join(appRoot, configsRoot, PET_CACHE_FILENAME));
    const launcherConfigStorage = new FileSystemStorage(path.join(appRoot, configsRoot, LAUNCHER_CONFIG_FILENAME));
    const modIndexStorage = new FileSystemStorage(path.join(appRoot, configsRoot, MOD_LIST_FILENAME));
    const taskOptionsStorage = new FileSystemStorage(path.join(appRoot, configsRoot, TASK_OPTIONS_FILENAME));

    const petCatchTime = new PetCatchTime(petCatchTimeStorage);
    const launcherConfig = new LauncherConfig(launcherConfigStorage);
    const modIndex = new ModIndex(modIndexStorage);
    const taskConfig = new TaskOptions(taskOptionsStorage);
    await Promise.all([petCatchTime.load(), launcherConfig.load(), taskConfig.load(), modIndex.load()]);

    return {
        petCatchTime,
        launcherConfig,
        taskConfig,
        modIndex
    };
};
