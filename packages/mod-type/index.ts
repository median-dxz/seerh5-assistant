import type { LevelBattle, LevelRunner, MoveStrategy } from '@sea/core';

export type SEAFormItem =
    | {
          type: 'input';
          default: string;
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
    helperText?: string;
};

export type SEAConfigSchema = Record<string, SEAFormItemSchema | undefined>;

export type GetFormItemType<TFormItem extends SEAFormItem | undefined> = TFormItem extends SEAFormItem
    ? TFormItem['type'] extends 'input' | 'select' | 'battle'
        ? string
        : TFormItem['type'] extends 'checkbox'
          ? boolean
          : never
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
    data?: object;
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

    ct(...pets: string[]): number[];
    battle(name: string): LevelBattle;
}

export interface SEAModExport {
    strategies?: Strategy[];
    battles?: Battle[];
    tasks?: Task[];
    commands?: Command[];
    install?(this: void): void;
    uninstall?(this: void): void;
}

export type Strategy = MoveStrategy & { name: string };

export interface Battle {
    name: string;
    strategy: string;
    pets: string[];
    beforeBattle?: () => Promise<void>;
}

/** 关卡的动态数据 */
export interface LevelData {
    /** 当日最大次数 */
    maxTimes: number;
    /** 剩余的每日次数 */
    remainingTimes: number;
    /** 当前次数下的进度 */
    progress: number;
}

type VoidFunction = () => Promise<void> | void;

export interface Task<
    TSchema extends SEAConfigSchema | undefined = undefined,
    TData extends LevelData = LevelData,
    TActions extends string = string
> {
    readonly metadata: { id: string; name: string };
    readonly configSchema?: TSchema;
    runner(
        options: TSchema extends SEAConfigSchema ? GetConfigObjectTypeFromSchema<NonNullable<TSchema>> : undefined
    ): Omit<LevelRunner, 'next' | 'actions'> & {
        name?: string;
        next: () => TActions;
        data: TData;
        actions: Partial<Record<NoInfer<TActions>, VoidFunction>> &
            ThisType<{ data: TData } & Pick<LevelRunner, 'logger'>>;
    };
}

export function task<
    TData extends LevelData,
    TActions extends string,
    TSchema extends SEAConfigSchema | undefined = undefined
>(taskDefinition: Task<TSchema, TData, TActions>): Task {
    return taskDefinition as Task;
}

export interface Command {
    name: string;
    icon?: string;
    description?: string | (() => string);
    parametersDescription?: string | (() => string);
    handler: (args?: PlainObject) => unknown;
}

export interface PlainObject {
    [key: string]: string | number | boolean | null | PlainObject | PlainObject[];
}
