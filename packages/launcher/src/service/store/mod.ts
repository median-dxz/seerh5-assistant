import * as EndPoints from '../endpoints';
import { buildMeta, createModContext } from '../mod/context';

type Mod = SEAL.ModExport;
type ModModuleExport = (createContext: typeof createModContext) => Promise<Mod>;

import type { AnyFunction } from 'sea-core';
import { getNamespace } from '../mod/context';
import * as StrategyStore from '../store/strategy';

export class ModInstance {
    meta: SEAL.Meta & { namespace: string };
    finalizers: AnyFunction[] = [];

    strategy: string[] = [];

    constructor(meta: SEAL.Meta) {
        this.meta = { ...meta, namespace: getNamespace(meta) };
    }

    setUninstall(uninstall?: AnyFunction) {
        uninstall && this.finalizers.push(uninstall);
    }

    tryRegisterStrategy(strategy?: SEAL.Strategy[]) {
        if (!strategy) return;

        strategy.forEach((strategy) => {
            StrategyStore.add(this.meta.namespace, strategy);
            this.strategy.push(strategy.name);
        });

        this.finalizers.push(() => {
            this.strategy.forEach((name) => StrategyStore.tryRemove(name));
        });
    }

    dispose() {
        this.finalizers.forEach((finalizer) => finalizer());
    }
}

export const store = new Map<string, ModInstance>();

export async function fetchMods() {
    const modList = await EndPoints.getAllMods();

    const promises = modList.map(({ path }) =>
        import(/* @vite-ignore */ `/mods/${path}?r=${Math.random()}`)
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin strategy
    promises.push(
        import('@/builtin/strategy')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin battle
    promises.push(
        import('@/builtin/strategy')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin level
    promises.push(
        import('@/builtin/level')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    return Promise.all(promises);
}

export function setup({ install, uninstall, meta, exports }: Mod) {
    // 确保meta合法
    meta = buildMeta(meta);

    const ins = new ModInstance(meta);

    // 执行副作用
    try {
        ins.setUninstall(uninstall);
        install?.();
        console.log(`模组安装中: ${ins.meta.namespace}`);
    } catch (error) {
        console.error(`模组安装失败: ${ins.meta.namespace}`, error);
    }

    // 加载导出的策略
    ins.tryRegisterStrategy(exports?.strategy);

    store.set(ins.meta.namespace, ins);
}

export function teardown() {
    store.forEach((mod) => {
        try {
            mod.dispose();
            console.log(`卸载模组: ${mod.meta.namespace}`);
        } catch (error) {
            console.error(`模组卸载失败: ${mod.meta.namespace}`, error);
        }
    });
    store.clear();
}

// try {
//     mod.deactivate?.();
//     // log(`卸载模组: ${mod.meta.id}`);
// } catch (error) {
//     console.error(`卸载模组失败: ${mod.meta.id}`, error);
// }

// const subscription = new Subscription();
// const $module = DataSource.gameModule;

// moduleMod.activate = function () {
//     if (this.load) {
//         subscription.on($module(this.moduleName, 'load'), this.load.bind(this));
//     }
//     if (this.show) {
//         subscription.on($module(this.moduleName, 'show'), this.show.bind(this));
//     }
//     if (this.mainPanel) {
//         subscription.on($module(this.moduleName, 'mainPanel'), this.mainPanel.bind(this));
//     }
//     if (this.destroy) {
//         subscription.on($module(this.moduleName, 'destroy'), this.destroy.bind(this));
//     }
// };
// moduleMod.deactivate = function () {
//     subscription.dispose();
// };
