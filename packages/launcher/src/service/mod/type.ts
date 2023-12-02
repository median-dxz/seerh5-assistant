import type { AnyFunction } from 'sea-core';
import * as StrategyStore from '../StrategyStore';
import { getNamespace } from './context';

export class SEAModInstance {
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
