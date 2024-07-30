import path from 'node:path';
import { configsRoot, modsRoot } from '../paths.ts';
import { FileSystemStorage } from '../shared/FileSystemStorage.ts';

import { ModManager } from '../router/mod/manager.ts';
import { praseCompositeId } from '../shared/index.ts';
import { LauncherConfig } from './LauncherConfig.ts';
import { ModIndex } from './ModIndex.ts';
import { PetCatchTime } from './PetCatchTime.ts';
import { TaskConfig } from './TaskConfig.ts';

const PET_CACHE_FILENAME = 'sea-pets.json';
const MOD_LIST_FILENAME = 'sea-mods.json';
const LAUNCHER_CONFIG_FILENAME = 'sea-launcher.json';
const TASK_CONFIG_FILENAME = 'sea-task-config.json';

export const initConfigHandlers = async (appRoot: string) => {
    const petCatchTimeStorage = new FileSystemStorage(path.join(appRoot, configsRoot, PET_CACHE_FILENAME));
    const launcherConfigStorage = new FileSystemStorage(path.join(appRoot, configsRoot, LAUNCHER_CONFIG_FILENAME));
    const modIndexStorage = new FileSystemStorage(path.join(appRoot, configsRoot, MOD_LIST_FILENAME));
    const taskConfigStorage = new FileSystemStorage(path.join(appRoot, configsRoot, TASK_CONFIG_FILENAME));
    const modConfigStorageBuilder = (cid: string) => {
        const { id, scope } = praseCompositeId(cid);
        return new FileSystemStorage(path.join(appRoot, configsRoot, modsRoot, `${scope}.${id}.json`));
    };
    const modDataStorageBuilder = (cid: string) => {
        const { id, scope } = praseCompositeId(cid);
        return new FileSystemStorage(path.join(appRoot, modsRoot, `${scope}.${id}.data.json`));
    };

    const petCatchTime = new PetCatchTime(petCatchTimeStorage);
    const launcherConfig = new LauncherConfig(launcherConfigStorage);
    const modIndex = new ModIndex(modIndexStorage);
    const taskConfig = new TaskConfig(taskConfigStorage);
    await Promise.all([petCatchTime.load(), launcherConfig.load(), taskConfig.load(), modIndex.load()]);

    const modManager = new ModManager(modIndex, modConfigStorageBuilder, modDataStorageBuilder);
    await modManager.init();

    return {
        petCatchTime,
        launcherConfig,
        taskConfig,
        modManager
    };
};
