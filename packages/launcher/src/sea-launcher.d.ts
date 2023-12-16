import type { ILevelRunner, MoveStrategy, VERSION } from 'sea-core';

declare module 'sea-core' {
    export interface Engine {
        updateBattleFireInfo(): Promise<{
            type: number;
            valid: boolean;
            timeLeft: number;
        }>;

        /**
         * @param type 装备类型, 代表装备的位置(目镜, 头部, 腰部等)
         * @param itemId 装备的**物品**id
         */
        changeEquipment(type: Parameters<UserInfo['requestChangeClothes']>[0], itemId: number): Promise<void>;
    }

    export interface GameConfigMap {
        nature: seerh5.NatureObj;
    }

    /** 关卡的静态数据, 实现时可以使用getter来方便获取 */
    export interface LevelMeta {
        id: string;
        name: string;
        maxTimes: number;
    }
}

declare global {
    namespace seerh5 {
        interface NatureObj extends seerh5.BaseObj {
            id: number;
            name: string;
        }
    }

    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
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
            core: VERSION;
            description?: string;
        };

        interface CreateContextOptions<TConfig> {
            meta: Omit<Partial<Meta>, 'id' | 'core'> & { id: string; core: VERSION };
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
        type Level = { new (option: any): ILevelRunner; readonly meta: LevelMeta };

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

    declare class NatureXMLInfo {
        static _dataMap: seerh5.Dict<seerh5.NatureObj>;
    }
}

export { };

