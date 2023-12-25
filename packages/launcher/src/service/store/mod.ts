import * as EndPoints from '../endpoints';
import { buildMeta, createModContext } from '../mod/createContext';

import type { Battle, Command, ModExport, ModMeta, Strategy, Task } from '@/sea-launcher';
type Mod = ModExport;
type ModModuleExport = (createContext: typeof createModContext) => Promise<Mod>;

import type { AnyFunction } from '@sea/core';
import { getNamespace } from '../mod/createContext';
import * as battleStore from './battle';
import * as commandStore from './command';
import * as strategyStore from './strategy';
import * as taskStore from './task';

export class ModInstance {
    meta: ModMeta & { namespace: string };
    finalizers: AnyFunction[] = [];

    strategy: string[] = [];
    battle: string[] = [];
    level: string[] = [];
    command: string[] = [];

    constructor(meta: ModMeta) {
        this.meta = { ...meta, namespace: getNamespace(meta) };
    }

    setUninstall(uninstall?: AnyFunction) {
        uninstall && this.finalizers.push(uninstall);
    }

    tryRegisterStrategy(strategy?: Strategy[]) {
        if (!strategy) return;

        strategy.forEach((strategy) => {
            strategyStore.add(this.meta.namespace, strategy);
            this.strategy.push(strategy.name);
        });

        this.finalizers.push(() => {
            this.strategy.forEach((name) => strategyStore.tryRemove(name));
        });
    }

    tryRegisterBattle(battle?: Battle[]) {
        if (!battle) return;

        battle.forEach((battle) => {
            battleStore.add(this.meta.namespace, battle);
            this.battle.push(battle.name);
        });

        this.finalizers.push(() => {
            this.battle.forEach((name) => battleStore.tryRemove(name));
        });
    }

    tryRegisterTask(level?: Task[]) {
        if (!level) return;

        level.forEach((level) => {
            taskStore.add(this.meta.namespace, level);
            this.level.push(level.meta.name);
        });

        this.finalizers.push(() => {
            this.level.forEach((name) => taskStore.tryRemove(name));
        });
    }

    tryRegisterCommand(command?: Command[]) {
        if (!command) return;

        command.forEach((command) => {
            commandStore.add(this.meta.namespace, command);
            this.command.push(command.name);
        });

        this.finalizers.push(() => {
            this.command.forEach((name) => commandStore.tryRemove(name));
        });
    }

    dispose() {
        this.finalizers.forEach((finalizer) => finalizer());
    }
}

export const store = new Map<string, ModInstance>();

export async function fetchMods(mods?: EndPoints.ModPathList) {
    const modList = mods ?? (await EndPoints.getAllMods());

    const promises = modList.map(({ path }) =>
        import(/* @vite-ignore */ `/mods/${path}?r=${Math.random()}`)
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
            .then()
    );

    // builtin strategy
    promises.push(
        import('@/builtin/strategy')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin battle
    promises.push(
        import('@/builtin/battle')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin level
    promises.push(
        import('@/builtin/realm')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    promises.push(
        import('@/builtin/petFragment')
            .then((module) => module.default as ModModuleExport)
            .then((mod) => mod(createModContext))
    );

    // builtin command
    promises.push(
        import('@/builtin/command')
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

    // 加载导出的内容
    ins.tryRegisterStrategy(exports?.strategy);
    ins.tryRegisterBattle(exports?.battle);
    ins.tryRegisterTask(exports?.task);
    ins.tryRegisterCommand(exports?.command);

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
