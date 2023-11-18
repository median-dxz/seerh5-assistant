// @ts-check
/// <reference types="vite/client" />

type SEALevelInfo = import('sea-core').SEALevelInfo;
type SEALevelData = import('sea-core').SEALevelData;
type ILevelRunner<D extends SEALevelData, I extends SEALevelInfo> = import('sea-core').ILevelRunner<D, I>;
type MoveStrategy = import('sea-core').MoveStrategy;

declare namespace SEAMod {
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

    interface IBaseMod extends Mod {
        defaultConfig?: T;
        config?: T;
        exports?: Record<string, import('sea-core').AnyFunction>;
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

    interface IBattleMod extends Mod {
        pets: number[];
        beforeBattle?: () => Promise<void>;
        strategy: string;
    }

    interface IStrategy extends Mod, MoveStrategy {}

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
        show?(): string; // 用以显示提示量，两个只能启用一个
        showAsync?(): Promise<string>;
    }
}
