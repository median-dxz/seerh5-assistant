import { SEAEventTarget, type EventData, type Handler } from '../common/EventTarget.js';
import type { GameModuleMap } from '../constant/type.js';
import { UIModuleHelper } from '../engine/index.js';

type GameModuleInstance<TModule extends string> = EventData<TModule, GameModuleMap, BaseModule>;

export type GameModuleLoadHandler = () => void;
export type GameModuleShowHandler<TModule extends string> = (ctx: GameModuleInstance<TModule>) => void;
export type GameModuleMainPanelHandler<TModule extends string> = (ctx: GameModuleInstance<TModule>) => void;
export type GameModuleDestroyHandler = () => void;

type ModuleEvent = 'load' | 'show' | 'mainPanel' | 'destroy';

type HandlerType<TModule extends string> = {
    load: GameModuleLoadHandler;
    show: GameModuleShowHandler<TModule>;
    mainPanel: GameModuleMainPanelHandler<TModule>;
    destroy: GameModuleDestroyHandler;
};

type GetHandlerType<E extends ModuleEvent, TModule extends string> = HandlerType<TModule>[E];

export interface GameModuleEventHandler<T extends BaseModule = BaseModule> {
    moduleName: string;
    load?(): void;
    show?(ctx: T): void;
    mainPanel?(ctx: T): void;
    destroy?(): void;
}

export const GameModuleEventEmitter = {
    eventTarget: {
        load: new SEAEventTarget(),
        show: new SEAEventTarget(),
        mainPanel: new SEAEventTarget(),
        destroy: new SEAEventTarget(),
    },

    on<TModule extends string, TEvent extends ModuleEvent>(
        module: TModule,
        type: TEvent,
        handler: GetHandlerType<TEvent, TModule>
    ) {
        this.eventTarget[type].on(module, handler as Handler<unknown>);
    },

    off<TModule extends string, TEvent extends ModuleEvent>(
        module: TModule,
        type: TEvent,
        handler: GetHandlerType<TEvent, TModule>
    ) {
        this.eventTarget[type].off(module, handler as Handler<unknown>);
    },

    once<TModule extends string, TEvent extends ModuleEvent>(
        module: TModule,
        type: TEvent,
        handler: GetHandlerType<TEvent, TModule>
    ) {
        this.eventTarget[type].once(module, handler as Handler<unknown>);
    },

    emit(module: string, hook: ModuleEvent) {
        if (hook === 'show' || hook === 'mainPanel') {
            const moduleInstance = UIModuleHelper.currentModule();
            this.eventTarget[hook].emit(module, moduleInstance);
        } else {
            this.eventTarget[hook].emit(module);
        }
    },
};
