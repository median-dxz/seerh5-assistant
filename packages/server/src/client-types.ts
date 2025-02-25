import type { LauncherConfigKeys } from './configHandlers/LauncherConfig.ts';
import type { apiRouter } from './router/index.ts';

export type ApiRouter = typeof apiRouter;

export type { LauncherConfigType } from './configHandlers/LauncherConfig.ts';
export type { ModState } from './configHandlers/ModIndex.ts';
export type { InstallModOptions } from './router/mod/schemas.ts';

export type ConfigKeys = keyof typeof LauncherConfigKeys;

export type Recipe<T> = ((data: T) => void) | ((data: T) => T);

// for tRPC client type inference
export type { LauncherConfig } from './configHandlers/LauncherConfig.ts';
export type { PetCatchTime } from './configHandlers/PetCatchTime.ts';
export type { TaskOptions } from './configHandlers/TaskOptions.ts';
export type { ModManager } from './shared/ModManager.ts';
export type { IModFileHandler } from './shared/utils.ts';
