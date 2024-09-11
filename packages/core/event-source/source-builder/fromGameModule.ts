import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs';
import { type GameModuleMap } from '../../constant/TypeMaps.js';
import { engine } from '../../internal/engine.js';
import { SEAEventSource } from '../EventSource.js';
import { $hook } from './fromHook.js';

type ModuleEvent = 'load' | 'show' | 'mainPanel' | 'destroy';

const $fromGameModule = {
    load(module: string) {
        return $hook('module:loadScript').pipe(
            filter((_module) => _module === module),
            map(() => undefined)
        );
    },
    show<TModule extends string>(module: TModule): Observable<GameModuleMap[TModule]> {
        return $hook('module:show').pipe(
            filter(({ module: _module }) => _module === module),
            map(({ moduleInstance }) => moduleInstance)
        );
    },
    mainPanel<TModule extends string>(module: TModule): Observable<GameModuleMap[TModule]> {
        return $hook('module:openMainPanel').pipe(
            filter(({ module: _module }) => _module === module),
            map(() => engine.inferCurrentModule<GameModuleMap[TModule]>())
        );
    },
    destroy(module: string) {
        return $hook('module:destroy').pipe(
            filter((_module) => _module === module),
            map(() => undefined)
        );
    }
};

export function fromGameModule(module: string, event: 'load'): SEAEventSource<undefined>;
export function fromGameModule<TModule extends string>(
    module: TModule,
    event: 'show' | 'mainPanel' | 'destroy'
): SEAEventSource<GameModuleMap[TModule]>;
export function fromGameModule<TModule extends string, TEvent extends ModuleEvent>(module: TModule, event: TEvent) {
    switch (event) {
        case 'load':
            return new SEAEventSource($fromGameModule.load(module));
        case 'show':
            return new SEAEventSource($fromGameModule.show(module));
        case 'mainPanel':
            return new SEAEventSource($fromGameModule.mainPanel(module));
        case 'destroy':
            return new SEAEventSource($fromGameModule.destroy(module));
        default:
            throw new Error(
                `Invalid type ${event as string}, type could only be 'load' | 'show' | 'mainPanel' | 'destroy'`
            );
    }
}
