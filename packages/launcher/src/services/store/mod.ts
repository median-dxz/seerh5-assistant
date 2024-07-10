import { debounce, type AnyFunction } from '@sea/core';
import type { Battle, Command, SEAModContext, SEAModExport, Strategy, Task } from '@sea/mod-type';
import { effect, stop, toRaw } from '@vue/reactivity';

import { dequal } from 'dequal';
import * as endpoints from '../endpoints';
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
        public ctx: SEAModContext<DefinedModMetadata>,
        { battles, commands, install, strategies, tasks, uninstall }: SEAModExport
    ) {
        // 加载导出的内容
        this.tryRegisterStrategies(strategies);
        this.tryRegisterBattle(battles);
        this.tryRegisterTask(tasks);
        this.tryRegisterCommand(commands);

        // 执行副作用
        install && install();

        // 声明data的模组需要注册响应式更新以及清理函数
        if (ctx.data) {
            const mutate = debounce(
                () => void endpoints.mod.setData(ctx.meta.scope, ctx.meta.id, toRaw(ctx.data)!),
                1000
            );
            const effectRunner = effect(() => {
                dequal(ctx.data, toRaw(ctx.data));
                mutate();
            });

            this.addFinalizer(() => {
                stop(effectRunner);
            });
        }

        uninstall && this.addFinalizer(uninstall);
    }

    get namespace() {
        return getNamespace(this.ctx.meta);
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
            this.tasks.push(task.metadata.name);
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
        try {
            store.delete(mod.namespace);
            mod.dispose();
            console.log(`撤销模组部署: ${mod.namespace}`);
        } catch (error) {
            console.error(`撤销模组部署失败: ${mod.namespace}`, error);
        }
    });
}
