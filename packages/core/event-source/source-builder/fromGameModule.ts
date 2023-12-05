import { filter, map } from 'rxjs';
import { Hook } from '../../constant/index.js';
import { type GameModuleMap } from '../../constant/type.js';
import { Engine } from '../../engine/index.js';
import { SEAEventSource } from '../EventSource.js';
import { $hook } from './fromHook.js';

type ModuleEvent = 'load' | 'show' | 'mainPanel' | 'destroy';

const $fromGameModule = {
    load<TModule extends string>(module: TModule) {
        return $hook(Hook.Module.loadScript).pipe(
            filter((_module) => _module === module),
            map(() => undefined)
        );
    },
    show<TModule extends string>(module: TModule) {
        return $hook(Hook.Module.show).pipe(
            filter(({ module: _module }) => _module === module),
            map(({ moduleInstance }) => moduleInstance as GameModuleMap[TModule])
        );
    },
    mainPanel<TModule extends string>(module: TModule) {
        return $hook(Hook.Module.openMainPanel).pipe(
            filter(({ module: _module }) => _module === module),
            map(() => Engine.inferCurrentModule<GameModuleMap[TModule]>())
        );
    },
    destroy<TModule extends string>(module: TModule) {
        return $hook(Hook.Module.destroy).pipe(
            filter((_module) => _module === module),
            map(() => undefined)
        );
    },
};

export function fromGameModule(module: string, event: ModuleEvent): SEAEventSource<unknown>;
export function fromGameModule<TModule extends string>(module: TModule, event: 'load'): SEAEventSource<undefined>;
export function fromGameModule<TModule extends string>(
    module: TModule,
    event: 'show'
): SEAEventSource<GameModuleMap[TModule]>;
export function fromGameModule<TModule extends string>(
    module: TModule,
    event: 'mainPanel'
): SEAEventSource<GameModuleMap[TModule]>;
export function fromGameModule<TModule extends string>(module: TModule, event: 'destroy'): SEAEventSource<undefined>;

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
            throw `Invalid type ${event as string}, type could only be 'load' | 'show' | 'mainPanel' | 'destroy'`;
    }
}
