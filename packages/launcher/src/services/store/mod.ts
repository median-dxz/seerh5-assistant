import type { Battle, Command, SEAModExport, Strategy, Task } from '@sea/mod-type';

import { type AnyFunction } from '@sea/core';
import { getNamespace, type DefinedModMetadata } from '../mod/metadata';
import * as battleStore from './battle';
import * as commandStore from './command';
import * as strategyStore from './strategy';
import * as taskStore from './task';

export class ModInstance {
    finalizers: AnyFunction[] = [];

    strategies: string[] = [];
    battles: string[] = [];
    tasks: string[] = [];
    commands: string[] = [];

    constructor(
        public meta: DefinedModMetadata,
        { battles, commands, install, strategies, tasks, uninstall }: SEAModExport
    ) {
        // 加载导出的内容
        this.tryRegisterStrategies(strategies);
        this.tryRegisterBattle(battles);
        this.tryRegisterTask(tasks);
        this.tryRegisterCommand(commands);

        // 执行副作用
        install && install();

        uninstall && this.addFinalizer(uninstall);
    }

    get namespace() {
        return getNamespace(this.meta);
    }

    addFinalizer(finalizer: AnyFunction) {
        this.finalizers.push(finalizer);
    }

    private tryRegisterStrategies(strategies?: Strategy[]) {
        if (!strategies) return;

        strategies.forEach((strategy) => {
            strategyStore.add(this.namespace, strategy);
            this.strategies.push(strategy.name);
        });

        this.finalizers.push(() => {
            this.strategies.forEach((name) => {
                strategyStore.tryRemove(name);
            });
        });
    }

    private tryRegisterBattle(battles?: Battle[]) {
        if (!battles) return;

        battles.forEach((battle) => {
            battleStore.add(this.namespace, battle);
            this.battles.push(battle.name);
        });

        this.finalizers.push(() => {
            this.battles.forEach((name) => {
                battleStore.tryRemove(name);
            });
        });
    }

    private tryRegisterTask(tasks?: Task[]) {
        if (!tasks) return;

        tasks.forEach((task) => {
            taskStore.add(this.namespace, task);
            this.tasks.push(task.meta.name);
        });

        this.finalizers.push(() => {
            this.tasks.forEach((name) => {
                taskStore.tryRemove(name);
            });
        });
    }

    private tryRegisterCommand(commands?: Command[]) {
        if (!commands) return;

        commands.forEach((command) => {
            commandStore.add(this.namespace, command);
            this.commands.push(command.name);
        });

        this.finalizers.push(() => {
            this.commands.forEach((name) => {
                commandStore.tryRemove(name);
            });
        });
    }

    dispose() {
        this.finalizers.forEach((finalizer) => {
            finalizer();
        });
    }
}

export const store = new Map<string, ModInstance>();

export function teardown() {
    store.forEach((mod) => {
        if (mod.finalizers.length === 0) {
            // need reload app
            return;
        }
        try {
            store.delete(mod.namespace);
            mod.dispose();
            console.log(`卸载模组: ${mod.namespace}`);
        } catch (error) {
            console.error(`模组卸载失败: ${mod.namespace}`, error);
        }
    });
}
