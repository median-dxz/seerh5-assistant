import { debounce, type AnyFunction } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import { effect, reactive, stop, toRaw } from '@vue/reactivity';
import { dequal } from 'dequal';

import { buildMetadata, getCompositeId, type DefinedModMetadata } from '@sea/mod-resolver';

import { trpcClient } from '@/services/shared';
import type { CommonLoggerBuilder } from '@/shared/logger';

import * as ctStore from '../catchTimeBinding/index';

import { battleStore } from './store';

export type ModFactory = (context: SEAModContext<SEAModMetadata>) => Promise<SEAModExport> | SEAModExport;

const { modRouter } = trpcClient;

async function getModData(uid: string, { scope, id, data: defaultData }: DefinedModMetadata) {
    if (defaultData) {
        const compositeId = getCompositeId({ scope, id });
        const data = await modRouter.data.query({ uid, compositeId });

        if (!data) {
            throw new Error(`Mod data not found: ${compositeId}`);
        }

        const proxyData = reactive(data);
        return { data: proxyData };
    }
    return {};
}

async function getModConfig(uid: string, { scope, id, configSchema }: DefinedModMetadata) {
    if (configSchema) {
        const compositeId = getCompositeId({ scope, id });
        const config = await modRouter.config.query({ uid, compositeId });

        if (!config) {
            throw new Error(`Mod config not found: ${compositeId}`);
        }

        return { config };
    }
    return {};
}

export async function createModContext(uid: string, metadata: SEAModMetadata, loggerBuilder: CommonLoggerBuilder) {
    const ct = (...pets: string[]) => {
        const r = pets.map((pet) => ctStore.ctByName(pet));
        if (r.some((v) => v === undefined)) {
            throw new Error(`Pet ${pets.toString()} not found`);
        }
        return r as number[];
    };

    const battle = (name: string) => {
        const r = battleStore.get(name);
        if (!r) {
            throw new Error(`LevelBattle ${name} not found`);
        }
        return r.levelBattle();
    };

    const meta = buildMetadata(metadata);
    const data = await getModData(uid, meta);
    const config = await getModConfig(uid, meta);

    return {
        meta,
        logger: loggerBuilder.logger,
        ct,
        battle,
        ...data,
        ...config
    } as SEAModContext<DefinedModMetadata>;
}

export class ModInstance {
    finalizers: AnyFunction[] = [];

    get metadata() {
        return this.ctx.meta;
    }

    compositeId: string;
    onDataChanged?: (payload: object) => void;

    constructor(
        public deploymentId: string,
        public ctx: SEAModContext<DefinedModMetadata>,
        { install, uninstall }: SEAModExport
    ) {
        this.compositeId = getCompositeId(ctx.meta);

        // 执行副作用
        install && install();

        // 声明data的模组需要注册响应式更新以及清理函数
        if (ctx.data) {
            let timer: number | undefined;
            const mutate = () => {
                this.onDataChanged?.(structuredClone(toRaw(ctx.data)!));
            };
            const debounceMutate = debounce(mutate, 300);

            const effectRunner = effect(() => {
                dequal(ctx.data, toRaw(ctx.data));

                if (timer) {
                    debounceMutate();
                } else {
                    mutate();
                }

                timer = setTimeout(() => {
                    timer = undefined;
                }, 300);
            });

            this.addFinalizer(() => {
                stop(effectRunner);
            });
        }

        uninstall && this.addFinalizer(uninstall);
    }

    addFinalizer(finalizer: AnyFunction) {
        this.finalizers.push(finalizer);
    }

    dispose() {
        this.finalizers.forEach((finalizer) => {
            finalizer();
        });
    }
}
