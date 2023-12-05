import type { ILevelRunner, MoveStrategy } from 'sea-core';

declare module 'sea-core' {
    export interface Engine {
        updateBattleFireInfo(): Promise<{
            type: number;
            valid: boolean;
            timeLeft: number;
        }>;
    }

    /** 关卡的静态数据, 实现时可以使用getter来方便获取 */
    export interface LevelMeta {
        id: string;
        name: string;
        maxTimes: number;
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

            ct(...pets: string[]): number[];
            battle(name: string): ILevelBattle;
        }

        type Meta = {
            id: string;
            scope: string;
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
                battle?: Array<Battle>;
                level?: Array<Level>;
                command?: Array<Command>;
                sign?: Array<Sign>;
            };
            install?(): void;
            uninstall?(): void;
        }

        type Strategy = MoveStrategy & { name: string };
        type Battle = {
            name: string;
            strategy: string;
            pets: string[];
            beforeBattle?: () => Promise<void>;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type Level = { new (option: any): ILevelRunner; meta: LevelMeta };

        type Command = {
            name: string;
            icon?: string;
            description?: string | (() => string);
            handler: (...args: string[]) => unknown;
        };
        type Sign = {
            name: string;
            check: () => Promise<number>;
            run: () => Promise<void>;
        };
    }
}

export { };

