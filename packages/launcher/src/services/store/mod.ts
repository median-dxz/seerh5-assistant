import type { Battle, Command, SEAModExport, SEAModMetadata, Strategy, Task } from '@sea/mod-type';

import { seac, type AnyFunction } from '@sea/core';
import { getNamespace } from '../mod/utils';
import * as battleStore from './battle';
import * as commandStore from './command';
import * as strategyStore from './strategy';
import * as taskStore from './task';

export class ModInstance {
    meta: SEAModMetadata & {
        namespace: string;
    };

    finalizers: AnyFunction[] = [];

    strategy: string[] = [];
    battle: string[] = [];
    level: string[] = [];
    command: string[] = [];

    constructor(meta: SEAModMetadata, { battles, commands, install, strategies, tasks, uninstall }: SEAModExport) {
        this.meta = { ...meta, namespace: getNamespace(meta) };
        // 加载导出的内容
        this.tryRegisterStrategy(strategies);
        this.tryRegisterBattle(battles);
        this.tryRegisterTask(tasks);
        this.tryRegisterCommand(commands);

        // 执行副作用
        install && install();

        uninstall && this.addFinalizer(uninstall);
    }

    addFinalizer(finalizer: AnyFunction) {
        this.finalizers.push(finalizer);
    }

    private tryRegisterStrategy(strategy?: Strategy[]) {
        if (!strategy) return;

        strategy.forEach((strategy) => {
            strategyStore.add(this.meta.namespace, strategy);
            this.strategy.push(strategy.name);
        });

        this.finalizers.push(() => {
            this.strategy.forEach((name) => strategyStore.tryRemove(name));
        });
    }

    private tryRegisterBattle(battle?: Battle[]) {
        if (!battle) return;

        battle.forEach((battle) => {
            battleStore.add(this.meta.namespace, battle);
            this.battle.push(battle.name);
        });

        this.finalizers.push(() => {
            this.battle.forEach((name) => battleStore.tryRemove(name));
        });
    }

    private tryRegisterTask(level?: Task[]) {
        if (!level) return;

        level.forEach((level) => {
            taskStore.add(this.meta.namespace, level);
            this.level.push(level.meta.name);
        });

        this.finalizers.push(() => {
            this.level.forEach((name) => taskStore.tryRemove(name));
        });
    }

    private tryRegisterCommand(command?: Command[]) {
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
