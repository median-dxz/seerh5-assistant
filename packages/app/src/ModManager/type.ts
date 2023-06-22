import { AnyFunction, type GameModuleEventHandler } from 'sa-core';

export enum SAModType {
    BASE_MOD = 'base',
    MODULE_MOD = 'module',
    SIGN_MOD = 'sign',
    LEVEL_MOD = 'level',
    BATTLE_MOD = 'battle',
    STRATEGY = 'strategy',
    QUICK_ACCESS_PLUGIN = 'quick_access_plugin',
}

export type MetaData = {
    id: string;
    author: string;
    type: SAModType;
    description?: string;
};

export class BaseMod {
    meta: MetaData;
    defaultConfig?: unknown;
    config?: unknown;
    logger: typeof console.log;
    activate?(): void;
    deactivate?(): void;
    export?: Record<string, AnyFunction>;
}

export class ModuleMod extends BaseMod {
    export = undefined;
    defaultConfig = undefined;
    config = undefined;

    moduleName: string;

    load?(): void;
    show?(ctx: BaseModule): void;
    mainPanel?(ctx: BaseModule): void;
    destroy?(): void;

    subscriber: GameModuleEventHandler<BaseModule>;

    activate() {
        // inject by ModManager
    }
    deactivate() {
        // inject by ModManager
    }
}
