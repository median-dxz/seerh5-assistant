import type { ILevelBattle, ILevelRunner, MoveStrategy, VERSION } from '@sea/core';

export type DataObject =
    | {
          [k: string]: unknown;
      }
    | NonNullable<object>;

export type SEAConfigItemSchema = (
    | {
          type: 'textInput';
          default: string;
      }
    | {
          type: 'numberInput';
          default: number;
      }
    | {
          type: 'select';
          list: Record<string, string>;
          default: string;
      }
    | {
          type: 'checkbox';
          default: boolean;
      }
) & {
    name: string;
    description?: string;
};

export type SEAModMetadata = {
    id: string;
    core: VERSION;
    scope?: string;
    version?: string;
    description?: string;
    preload?: boolean;
    data?: DataObject;
    configSchema?: Record<string, SEAConfigItemSchema>;
};

export type SEAModContext<TMetadata extends SEAModMetadata> = InnerModContext<
    TMetadata,
    TMetadata['configSchema'] extends Record<string, SEAConfigItemSchema> ? TMetadata['configSchema'] : undefined,
    TMetadata['data'] extends DataObject ? TMetadata['data'] : undefined
>;

export type InnerModContext<
    TMetadata extends SEAModMetadata,
    TConfigSchema extends Record<string, SEAConfigItemSchema> | undefined = undefined,
    TData extends DataObject | undefined = undefined
> = {
    meta: TMetadata;

    logger: typeof console.log;

    config: TConfigSchema extends Record<string, SEAConfigItemSchema>
        ? {
              [item in keyof TConfigSchema]: TConfigSchema[item]['type'] extends 'textInput' | 'select'
                  ? string
                  : TConfigSchema[item]['type'] extends 'numberInput'
                    ? number
                    : TConfigSchema[item]['type'] extends 'checkbox'
                      ? boolean
                      : never;
          }
        : undefined;
    configSchemas?: TConfigSchema;

    data: TData;
    mutate: TData extends undefined ? undefined : (recipe: (draft: TData) => void) => void;

    ct(...pets: string[]): number[];
    battle(name: string): ILevelBattle;
};

export interface SEAModExport {
    strategies?: Array<Strategy>;
    battles?: Array<Battle>;
    tasks?: Array<Task>;
    commands?: Array<Command>;
    install?(): void;
    uninstall?(): void;
}

export interface TaskRunner<TData extends LevelData = LevelData> extends ILevelRunner<TData> {
    get meta(): LevelMeta;
    get name(): string;
}

export type Strategy = MoveStrategy & { name: string };

export type Battle = {
    name: string;
    strategy: string;
    pets: string[];
    beforeBattle?: () => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Task = { new (option?: any): TaskRunner; readonly meta: LevelMeta };

export type Command = {
    name: string;
    icon?: string;
    description?: string | (() => string);
    handler: (...args: string[]) => unknown;
};

/** 关卡的静态数据, 实现时可以使用getter来方便获取 */
export interface LevelMeta {
    id: string;
    name: string;
    maxTimes: number;
}

export interface LevelData {
    /** 剩余的每日次数 */
    remainingTimes: number;
    /** 当前次数下的进度 */
    progress: number;
}

declare global {
    class NatureXMLInfo {
        static _dataMap: seerh5.Dict<seerh5.NatureObj>;
    }
}

declare module '@sea/core' {
    export interface SEAEngine {
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
}
