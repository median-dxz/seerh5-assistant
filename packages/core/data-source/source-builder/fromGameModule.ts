import { filter, map } from 'rxjs';
import { Hook } from '../../constant/index.js';
import { type GameModuleMap } from '../../constant/type.js';
import { Engine } from '../../engine/index.js';
import { DataSource } from '../DataSource.js';
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

export function fromGameModule(module: string, event: ModuleEvent): DataSource<unknown>;
export function fromGameModule<TModule extends string>(module: TModule, event: 'load'): DataSource<undefined>;
export function fromGameModule<TModule extends string>(
    module: TModule,
    event: 'show'
): DataSource<GameModuleMap[TModule]>;
export function fromGameModule<TModule extends string>(
    module: TModule,
    event: 'mainPanel'
): DataSource<GameModuleMap[TModule]>;
export function fromGameModule<TModule extends string>(module: TModule, event: 'destroy'): DataSource<undefined>;

export function fromGameModule<TModule extends string, TEvent extends ModuleEvent>(module: TModule, event: TEvent) {
    switch (event) {
        case 'load':
            return new DataSource($fromGameModule.load(module));
        case 'show':
            return new DataSource($fromGameModule.show(module));
        case 'mainPanel':
            return new DataSource($fromGameModule.mainPanel(module));
        case 'destroy':
            return new DataSource($fromGameModule.destroy(module));
        default:
            throw `Invalid type ${event as string}, type could only be 'load' | 'show' | 'mainPanel' | 'destroy'`;
    }
}
