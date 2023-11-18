import { MoveStrategy, type GameModuleEventHandler } from 'sea-core';

export enum SEAModType {
    BASE_MOD = 'base',
    MODULE_MOD = 'module',
    SIGN_MOD = 'sign',
    LEVEL_MOD = 'level',
    BATTLE_MOD = 'battle',
    STRATEGY = 'strategy',
    QUICK_ACCESS_PLUGIN = 'quick-access-plugin',
}

export type MetaData = {
    id: string;
    scope: string;
    type: SEAModType;
    description?: string;
};

export class BaseMod {
    meta: MetaData;
    namespace: string;
    defaultConfig?: unknown;
    config?: unknown;
    logger: typeof console.log;
    activate?(): void;
    deactivate?(): void;
    export?: unknown;
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

export interface SignModExport {
    check(): Promise<number>;
    run(): void;
}

export class QuickAccessPlugin extends BaseMod {
    icon: string;
    click(): void {
        // for declare
    }
    show?(): string;
    showAsync?(): Promise<string>;
}

export class StrategyMod extends BaseMod {
    export: MoveStrategy;
}

export interface BattleModExport {
    pets: string[];
    beforeBattle?: () => Promise<void>;
    strategy: string;
}

export class BattleMod extends BaseMod {
    ct: (...pets: string[]) => number[];
    export: BattleModExport;
}
