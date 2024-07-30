import type { LauncherConfigKeys } from './configHandlers/LauncherConfig.ts';
import type { apiRouter } from './router/index.ts';

export type ApiRouter = typeof apiRouter;

export type { LauncherConfigType } from './configHandlers/LauncherConfig.ts';
export type { ModState } from './configHandlers/ModIndex.ts';
export type { InstallModOptions } from './router/mod/schemas.ts';

export type ConfigKeys = keyof typeof LauncherConfigKeys;

export type Recipe<T> = ((data: T) => void) | ((data: T) => T);
