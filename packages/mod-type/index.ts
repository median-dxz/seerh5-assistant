/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-namespace */
import type { LevelBattle, LevelRunner, MoveStrategy } from '@sea/core';

export type DataObject = NonNullable<object>;

export type SEAFormItem =
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
    | {
          type: 'battle';
          default: string;
      };

export type SEAFormItemSchema = SEAFormItem & {
    name: string;
    description?: string;
};

export type SEAConfigSchema = Record<string, SEAFormItemSchema>;

export type GetFormItemType<TFormItem extends SEAFormItem> = TFormItem['type'] extends 'textInput' | 'select' | 'battle'
    ? string
    : TFormItem['type'] extends 'numberInput'
      ? number
      : TFormItem['type'] extends 'checkbox'
        ? boolean
        : never;

export type GetConfigObjectTypeFromSchema<TConfigSchema extends SEAConfigSchema> = {
    [item in keyof TConfigSchema]: GetFormItemType<TConfigSchema[item]>;
};

export interface SEAModMetadata {
    id: string;
    scope?: string;
    version?: string;
    description?: string;
    preload?: boolean;
    data?: DataObject;
    configSchema?: SEAConfigSchema;
}

export interface SEAModContext<TMetadata extends SEAModMetadata> {
    meta: TMetadata;

    logger: typeof console.log;

    config: TMetadata['configSchema'] extends undefined
        ? undefined
        : GetConfigObjectTypeFromSchema<NonNullable<TMetadata['configSchema']>>;
    configSchemas?: TMetadata['configSchema'];

    data: TMetadata['data'];
    mutate: TMetadata['data'] extends undefined
        ? undefined
        : (recipe: (draft: NonNullable<TMetadata['data']>) => void) => void;

    ct(...pets: string[]): number[];
    battle(name: string): LevelBattle;
}

export interface SEAModExport {
    strategies?: Strategy[];
    battles?: Battle[];
    tasks?: Task[];
    commands?: Command[];
    install?(): void;
    uninstall?(): void;
}

export type Strategy = MoveStrategy & { name: string };

export interface Battle {
    name: string;
    strategy: string;
    pets: string[];
    beforeBattle?: () => Promise<void>;
}

/** 关卡元数据 */
export interface LevelMeta {
    id: string;
    name: string;
    maxTimes: number;
}

/** 关卡的动态数据, 实现时可以使用getter来方便获取 */
export interface LevelData {
    /** 剩余的每日次数 */
    remainingTimes: number;
    /** 当前次数下的进度 */
    progress: number;
}

type VoidFunction = () => Promise<void> | void;

export interface Task<
    TMeta extends LevelMeta = LevelMeta,
    TSchema extends SEAConfigSchema | undefined = undefined,
    TData extends LevelData = LevelData,
    TActions extends string = string
> {
    readonly meta: TMeta;
    readonly configSchema?: TSchema;
    runner(
        metadata: TMeta,
        options: TSchema extends SEAConfigSchema ? GetConfigObjectTypeFromSchema<NonNullable<TSchema>> : undefined
    ): Omit<LevelRunner, 'next' | 'actions'> & {
        next: () => TActions;
        data: TData;
        actions: Partial<Record<NoInfer<TActions>, VoidFunction>> &
            ThisType<{ data: TData } & Pick<LevelRunner, 'logger'>>;
    };
}

export function task<
    TMeta extends LevelMeta,
    TData extends LevelData,
    TActions extends string,
    TSchema extends SEAConfigSchema | undefined = undefined
>(taskDefinition: Task<TMeta, TSchema, TData, TActions>): Task {
    return taskDefinition as Task;
}

export interface Command {
    name: string;
    icon?: string;
    description?: string | (() => string);
    handler: (...args: string[]) => unknown;
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
