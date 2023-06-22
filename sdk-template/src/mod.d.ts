// @ts-check
type SALevelInfo = import('sa-core').SALevelInfo;
type SALevelData = import('sa-core').SALevelData;

type ILevelRunner<D extends SALevelData, I extends SALevelInfo> = import('sa-core').ILevelRunner<D, I>;

type MoveStrategy = import('sa-core').MoveStrategy;

declare namespace SAMod {
    type MetaData = {
        id: string;
        author: string;
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
        exports?: Record<string, import('sa-core').AnyFunction>;
        activate?(): void;
        deactivate?(): void;
    }

    interface SignModExport {
        check: () => Promise<number>;
        run: () => void;
    }

    interface ISignMod<T> extends Mod {
        defaultConfig?: T;
        config?: T;
        export: Record<string, SignModExport>;
    }

    interface ILevelMod<TOption extends object, TData extends SALevelData, TInfo extends SALevelInfo>
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
