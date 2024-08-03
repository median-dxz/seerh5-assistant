import type { LauncherConfig } from './configHandlers/LauncherConfig.ts';
import type { PetCatchTime } from './configHandlers/PetCatchTime.ts';
import type { TaskOptions } from './configHandlers/TaskOptions.ts';
import type { ModManager } from './shared/ModManager.ts';
import type { IModFileHandler } from './shared/utils.ts';

interface BuildContextOptions {
    petCatchTime: PetCatchTime;
    launcherConfig: LauncherConfig;
    taskOptions: TaskOptions;
    modManager: ModManager;
    modFileHandler: IModFileHandler;
}

export function buildSEALContext(options: BuildContextOptions) {
    return function createContext() {
        return {
            ...options
        };
    };
}

type CreateContext = ReturnType<typeof buildSEALContext>;
export type Context = Awaited<ReturnType<CreateContext>>;
