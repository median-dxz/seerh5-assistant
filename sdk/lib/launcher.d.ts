import type { ILevelBattle, ILevelRunner, MoveStrategy, VERSION } from '@sea/core';

export type SEAConfigSchema = (
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

export type ModConfigSchema = Record<string, SEAConfigSchema>;

export type SEAModMetadata = {
    id: string;
    scope: string;
    version: string;
    core: VERSION;
    description?: string;
    preload?: boolean;
    data?: object;
    configSchema?: ModConfigSchema;
};

export type SEAModContext<TMetadata extends SEAModMetadata> = TMetadata extends {
    data?: infer TData extends object;
    configSchema?: infer TConfigSchemas extends ModConfigSchema;
}
    ? InnerModContext<TMetadata, TConfigSchemas, TData>
    : InnerModContext<TMetadata>;

export type InnerModContext<
    TMetadata extends SEAModMetadata,
    TConfigSchemas extends ModConfigSchema | undefined = undefined,
    TCustomData extends object | undefined = undefined
> = {
    meta: TMetadata;

    logger: typeof console.log;

    config: TConfigSchemas extends ModConfigSchema
        ? {
              [item in keyof TConfigSchemas]: TConfigSchemas[item]['default'];
          }
        : undefined;
    configSchemas?: TConfigSchemas;

    data: TCustomData;
    mutate: TCustomData extends undefined ? undefined : (recipe: (draft: TCustomData) => void) => void;

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
