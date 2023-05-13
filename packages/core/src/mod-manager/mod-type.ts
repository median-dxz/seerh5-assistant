import { GameModuleEventHandler, GameModuleListener } from '../event-bus';
import { SaModuleLogger, defaultStyle } from '../logger';

export abstract class BaseMod {
    reflect(method: string, ...args: any[]) {
        return (this as any)[method]?.(args);
    }

    getKeys(): string[] {
        return Object.keys(Object.getOwnPropertyDescriptors((this as any).__proto__)).filter(
            (key) => !key.startsWith('_') && !['getKeys', 'getParameterList', 'reflect', 'constructor'].includes(key)
        );
    }

    getParameterList(method: string): string[] {
        const prop = (this as any)[method];
        if (typeof prop === 'function') {
            return /\(\s*([\s\S]*?)\s*\)/.exec(prop)![1].split(/\s*,\s*/);
        }
        throw new TypeError(`${method} not a function`);
    }

    abstract init(): void;
    destroy?(): void;
    abstract meta: { id: string; description: string };
}

export abstract class ModuleMod<ModuleType extends BaseModule> extends BaseMod {
    log: ReturnType<typeof SaModuleLogger>;

    abstract moduleName: string;

    load() {}

    show(ctx: ModuleType) {}

    mainPanel(ctx: ModuleType) {}

    _destroy() {}

    subscriber: GameModuleEventHandler<ModuleType>;

    init() {
        this.log = SaModuleLogger(this.meta.id, defaultStyle.mod);

        this.subscriber = {
            moduleName: this.moduleName,
            load: this.load?.bind(this),
            show: this.show?.bind(this),
            mainPanel: this.mainPanel?.bind(this),
            destroy: this._destroy?.bind(this),
        };

        GameModuleListener.on(this.subscriber);
    }

    destroy() {
        GameModuleListener.off(this.subscriber);
    }
}
