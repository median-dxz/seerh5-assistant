import { tryGet } from '../common';
import { SeerModuleHelper } from '../engine';

export interface GameModuleEventHandler<T extends BaseModule = BaseModule> {
    moduleName: string;
    load?(): void;
    show?(ctx: T): void;
    mainPanel?(ctx: T): void;
    destroy?(): void;
}

type ModuleState = 'load' | 'show' | 'mainPanel' | 'destroy';

export const GameModuleListener = {
    handlers: new Map<string, Set<GameModuleEventHandler>>(),

    on(subscriber: GameModuleEventHandler) {
        const { moduleName } = subscriber;
        const subject = tryGet(this.handlers, moduleName);
        subject.add(subscriber);
    },

    off(subscriber: GameModuleEventHandler) {
        const { moduleName } = subscriber;
        if (this.handlers.has(moduleName)) {
            const subject = tryGet(this.handlers, moduleName);
            subject.delete(subscriber);
        }
    },

    emit(moduleName: string, hook: ModuleState) {
        if (!this.handlers.has(moduleName)) {
            return;
        }
        const subject = tryGet(this.handlers, moduleName);

        if (hook === 'show' || hook === 'mainPanel') {
            const module = SeerModuleHelper.currentModule();
            subject.forEach((handler) => {
                handler[hook]?.(module);
            });
        } else {
            subject.forEach((handler) => {
                handler[hook]?.();
            });
        }
    },
};
