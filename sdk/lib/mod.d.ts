import type {
    AnyFunction,
    ILevelRunner,
    MoveStrategy,
    LevelData as SEALevelData,
    LevelInfo as SEALevelInfo,
} from 'sea-core';

export namespace SEAMod {
    type MetaData = {
        id: string;
        scope: string;
        type: 'base' | 'module' | 'sign' | 'level' | 'battle' | 'strategy' | 'quick-access-plugin';
        description?: string;
    };

    interface Mod {
        meta: MetaData;
        logger: typeof console.log;
    }

    interface IBaseMod<T = undefined> extends Mod {
        defaultConfig?: T;
        config?: T & { use: (draft: T) => void };
        serializeConfig?(data: T): string;
        praseConfig?(serialized: unknown): T;
        exports?: Record<string, AnyFunction>;
        activate?(): void;
        deactivate?(): void;
    }

    interface SignModExport<T = undefined> {
        check: (this: T) => Promise<number>;
        run: (this: T) => void;
    }

    interface ISignMod<T = undefined> extends Mod {
        defaultConfig?: T;
        config?: T;
        export: Record<string, SignModExport<typeof this>>;
    }

    interface ILevelMod<TOption extends object, TData extends SEALevelData, TInfo extends SEALevelInfo>
        extends ILevelRunner<TData, TInfo>,
            Mod {
        defaultConfig?: TOption;
        config?: TOption;
    }

    /** 注意如果注册了监听器之类，必须在destroy中进行清理操作 */
    interface IModuleMod<ModuleType extends BaseModule> extends Mod {
        moduleName: string;
        load?(): void;
        show?(ctx: ModuleType): void;
        mainPanel?(ctx: ModuleType): void;
        destroy?(): void;
    }

    interface IQuickAccessPlugin extends Mod {
        icon: string;
        click(): void;
        show?(): string; // 显示提示，两个只能启用一个
        showAsync?(): Promise<string>;
    }
}

export { };

