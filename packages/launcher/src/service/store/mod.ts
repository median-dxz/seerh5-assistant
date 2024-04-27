import * as EndPoints from '../endpoints';
import { buildMeta, createModContext } from '../mod/createContext';

import type { Battle, Command, SEAModContext, SEAModExport, SEAModMetadata, Strategy, Task } from '@/sea-launcher';
import type { ModState } from '@sea/server';
type Mod = SEAModExport;
type ModModuleExport<TMetadata extends SEAModMetadata> = (context: SEAModContext<TMetadata>) => Promise<Mod>;

import { seac, type AnyFunction } from '@sea/core';
import { getNamespace } from '../mod/createContext';
import * as battleStore from './battle';
import * as commandStore from './command';
import * as strategyStore from './strategy';
import * as taskStore from './task';

export class ModInstance {
    meta: SEAModMetadata & {
        namespace: string;
    };
    state: ModState;

    finalizers: AnyFunction[] = [];

    strategy: string[] = [];
    battle: string[] = [];
    level: string[] = [];
    command: string[] = [];

    constructor(meta: SEAModMetadata, state: ModState) {
        this.meta = { ...meta, namespace: getNamespace(meta) };
        this.state = state;
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

export async function fetchMods(mods?: Array<{ id: string; scope: string }>) {
    const modList = mods ?? (await EndPoints.getAllModList());

    const promises = modList.map(
        ({ id, scope }) => import(/* @vite-ignore */ `/mods/${scope}/${id}/${id}.js?r=${Math.random()}`)
    );

    if (typeof window != 'undefined' && window.sea.SeerH5Ready === false) {
        // builtin preload mod
        promises.push(import('@/builtin/preload'));
    } else {
        // builtin strategy
        promises.push(import('@/builtin/strategy'));

        // builtin battle
        promises.push(import('@/builtin/battle'));

        // builtin level
        promises.push(import('@/builtin/realm'));

        promises.push(import('@/builtin/petFragment'));

        // builtin command
        promises.push(import('@/builtin/command'));
    }

    return Promise.all(
        promises.map(
            (promise) =>
                promise.then((module) => module.default as ModModuleExport).then((mod) => mod(createModContext))
            // TODO .then(mod=>{getModState()}) 向meta中添加state信息
        )
    );
}

export function setup(
    meta: SEAModMetadata,
    state: ModState,
    { install, uninstall, strategies, battles, tasks, commands }: Mod
) {
    // 确保meta合法
    meta = buildMeta(meta);

    // 检查preload标志是否和当前状态对应
    if ((typeof window != 'undefined' && window.sea.SeerH5Ready === false) !== Boolean(meta.preload)) {
        return;
    }

    const ins = new ModInstance(meta, state);

    // 执行副作用
    try {
        ins.setUninstall(uninstall);

        if (meta.preload && install) {
            seac.addSetupFn('beforeGameCoreInit', install);
        } else {
            install?.();
        }

        console.log(`模组安装中: ${ins.meta.namespace}`);
    } catch (error) {
        console.error(`模组安装失败: ${ins.meta.namespace}`, error);
    }

    // 加载导出的内容
    ins.tryRegisterStrategy(strategies);
    ins.tryRegisterBattle(battles);
    ins.tryRegisterTask(tasks);
    ins.tryRegisterCommand(commands);

    store.set(ins.meta.namespace, ins);
}

export function teardown() {
    store.forEach((mod) => {
        if (mod.finalizers.length === 0) {
            // need reload app
            return;
        }
        try {
            store.delete(mod.meta.namespace);
            mod.dispose();
            console.log(`卸载模组: ${mod.meta.namespace}`);
        } catch (error) {
            console.error(`模组卸载失败: ${mod.meta.namespace}`, error);
        }
    });
}

export function install(files: FileList) {
    console.log(files);
    // const reader = new FileReader();
    // reader.onload = async () => {
    //     const buffer = reader.result as ArrayBuffer;
    //     const mod = await EndPoints.installMod(buffer);
    //     setup(mod);
    // };
    // reader.readAsArrayBuffer(file);
}
