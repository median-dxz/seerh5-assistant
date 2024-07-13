import * as ctStore from '@/services/catchTimeBinding/CatchTimeBinding';
import * as endpoints from '@/services/endpoints';
import { store as battleStore } from '@/services/modStore/battle';
import { LauncherLoggerBuilder } from '@/shared/logger';
import { appStore } from '@/store';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import type { ModState } from '@sea/server';
import { taskStateActions } from '../taskSchedulerSlice';
import { buildMetadata, getNamespace, type DefinedModMetadata } from './metadata';
import { ModInstance, store } from './mod';
import { getModConfig, getModData } from './utils';

type ModFactory = (context: SEAModContext<SEAModMetadata>) => Promise<SEAModExport> | SEAModExport;

export async function createModContext(metadata: SEAModMetadata) {
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
            throw new Error(`Battle ${name} not found`);
        }
        return r.battle();
    };

    const meta = buildMetadata(metadata);

    const logger = LauncherLoggerBuilder.build(meta.id);

    const data = await getModData(meta);
    const config = await getModConfig(meta);

    return {
        meta,
        logger: (...args: unknown[]) => {
            logger(...args);
            if (typeof args[0] === 'string') {
                appStore.dispatch(taskStateActions.log(args[0]));
            }
        },
        ct,
        battle,
        ...data,
        ...config
    } as SEAModContext<DefinedModMetadata>;
}

class ModDeploymentHandler {
    constructor(
        public scope: string,
        public id: string,
        public state: ModState
    ) {}

    metadata?: DefinedModMetadata;
    factory?: ModFactory;

    async fetch() {
        if (this.state.builtin) {
            switch (this.id) {
                case 'builtin-preload':
                    await import('@/builtin/preload').then(({ default: factory, metadata }) => {
                        this.factory = factory as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                case 'builtin-strategy':
                    await import('@/builtin/strategy').then(({ default: factory, metadata }) => {
                        this.factory = factory as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                case 'builtin-battle':
                    await import('@/builtin/battle').then(({ default: factory, metadata }) => {
                        this.factory = factory as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                case 'realm':
                    await import('@/builtin/realm').then(({ default: factory, metadata }) => {
                        this.factory = factory as unknown as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                case 'PetFragmentLevel':
                    await import('@/builtin/petFragment').then(({ default: factory, metadata }) => {
                        this.factory = factory as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                case 'builtin-command':
                    await import('@/builtin/command').then(({ default: factory, metadata }) => {
                        this.factory = factory as ModFactory;
                        this.metadata = buildMetadata(metadata);
                    });
                    break;
                default:
                    throw new Error(`Unknown builtin mod: ${this.id}`);
            }
        } else {
            await import(/* @vite-ignore */ `/mods/${this.scope}.${this.id}.js?r=${Math.random()}`).then(
                ({ default: factory, metadata }: { default: ModFactory; metadata: SEAModMetadata }) => {
                    this.factory = factory;
                    this.metadata = buildMetadata(metadata);
                }
            );
        }
    }

    async deploy() {
        if (!this.metadata || !this.factory) {
            throw new Error(`模组: ${this.scope}::${this.id} 还未拉取代码`);
        }

        const namespace = getNamespace(this.metadata);
        try {
            const context = await createModContext(this.metadata);
            const exports = await this.factory(context);
            const ins = new ModInstance(context, exports);
            store.set(namespace, ins);
            // handlers.set(namespace, ins);
            console.log(`模组: ${namespace} 部署成功`);
        } catch (err) {
            console.error(`模组: ${namespace} 部署失败`, err);
        }
    }
}

export let deploymentHandlers: ModDeploymentHandler[] = [];

export async function fetchList() {
    const stateList = await endpoints.mod.fetchList();
    deploymentHandlers = stateList.map(({ scope, id, state }) => new ModDeploymentHandler(scope, id, state));
}
