import type { MoveStrategy } from 'sea-core';

/* eslint-disable */
declare module 'sea-core' {
    export interface Engine {
        updateBattleFireInfo(): Promise<{
            type: number;
            valid: boolean;
            timeLeft: number;
        }>;
    }
}

declare global {
    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
        EVENT_SEER_READY: string;
    }

    namespace SEAL {
        interface ModContext<TConfig> {
            meta: Meta;

            logger: typeof console.log;

            config: TConfig;
            mutate: (recipe: (draft: TConfig) => void) => void;
        }

        type ModType = 'base' | 'module' | 'command' | 'level';

        type Meta = {
            id: string;
            scope: string;
            type: ModType;
            version: string;
            description?: string;
        };

        interface CreateContextOptions<TConfig> {
            meta: Omit<Partial<Meta>, 'id'> & { id: string };
            defaultConfig?: TConfig;
        }

        type createModContext = <TConfig extends undefined | object = undefined>(
            options: CreateContextOptions<TConfig>
        ) => Promise<ModContext<TConfig>>;

        interface ModExport {
            meta: Meta;
            exports?: {
                strategy?: Array<Strategy>;
            };
            install?(): void;
            uninstall?(): void;
        }

        type Strategy = MoveStrategy & { name: string };
    }
}

export { };

