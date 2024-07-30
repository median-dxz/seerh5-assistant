import type { LauncherConfig } from './configHandlers/LauncherConfig.ts';
import type { PetCatchTime } from './configHandlers/PetCatchTime.ts';
import type { TaskConfig } from './configHandlers/TaskConfig.ts';
import type { ModManager } from './router/mod/manager.ts';

interface BuildContextOptions {
    petCatchTime: PetCatchTime;
    launcherConfig: LauncherConfig;
    taskConfig: TaskConfig;
    modManager: ModManager;
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
