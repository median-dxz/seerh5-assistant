import { ct } from '@sea-launcher/context/ct';
import * as EndPoints from '@sea-launcher/service/endpoints';
import { SEAModuleLogger } from '@sea-launcher/utils/logger';
import type { ILevelBattleStrategy, MoveStrategy } from 'sea-core';
import { EventBus, GameModuleEventEmitter } from 'sea-core/emitter';
import {
    BaseMod,
    BattleMod,
    ModuleMod,
    QuickAccessPlugin,
    SEAModType,
    StrategyMod,
    type BattleModExport,
    type SignModExport,
} from './type';

const log = SEAModuleLogger('SEAModManager', 'info');

export const ModStore = new Map<string, BaseMod>();

type ModModuleExport = typeof BaseMod | Array<typeof BaseMod>;

export const SEAModManager = {
    async fetchMods() {
        const modList = await EndPoints.getAllMods();
        const promises = modList.map(({ path }) =>
            import(/* @vite-ignore */ `/mods/${path}?r=${Math.random()}`)
                .then((module) => module.default as ModModuleExport)
                .then((mod) => {
                    if (Array.isArray(mod)) {
                        return mod.map((m) => new m());
                    } else {
                        return new mod();
                    }
                })
        );
        // builtin strategy
        promises.push(
            import('@sea-launcher/builtin/strategy')
                .then((s) => s.default as Array<{ id: string; strategy: MoveStrategy }>)
                .then((s) => {
                    return s.map(({ id, strategy }) => {
                        const mod = new BaseMod();
                        mod.meta = {
                            id,
                            scope: 'sa',
                            type: SEAModType.STRATEGY,
                        };
                        mod.export = strategy;
                        return mod;
                    });
                })
        );
        // builtin battle
        promises.push(
            import('@sea-launcher/builtin/battle')
                .then((s) => s.default as Array<{ id: string; battle: BattleModExport }>)
                .then((s) => {
                    return s.map(({ id, battle }) => {
                        const mod = new BaseMod();
                        mod.meta = {
                            id,
                            scope: 'sa',
                            type: SEAModType.BATTLE_MOD,
                        };
                        mod.export = battle;
                        return mod;
                    });
                })
        );
        return Promise.all(promises)
            .then((mods) => mods.flat())
            .then(async (mods) => {
                await Promise.all(mods.map((mod) => injectModConfig(mod)));
                return mods;
            });
    },

    setup(mods: BaseMod[]) {
        mods.forEach((mod) => {
            const { meta } = mod;
            const modNamespace = `${meta.type}::${meta.scope}::${meta.id}`;

            switch (meta.type) {
                case SEAModType.BASE_MOD:
                    break;
                case SEAModType.MODULE_MOD:
                    {
                        const moduleMod = mod as ModuleMod;

                        const eventBus = new EventBus();
                        const gameModuleEmitter = eventBus.delegate(GameModuleEventEmitter);
                        moduleMod.activate = function () {
                            if (this.load) {
                                gameModuleEmitter.on(this.moduleName, 'load', this.load.bind(this));
                            }
                            if (this.show) {
                                gameModuleEmitter.on(this.moduleName, 'show', this.show.bind(this));
                            }
                            if (this.mainPanel) {
                                gameModuleEmitter.on(this.moduleName, 'mainPanel', this.mainPanel.bind(this));
                            }
                            if (this.destroy) {
                                gameModuleEmitter.on(this.moduleName, 'destroy', this.destroy.bind(this));
                            }
                        };

                        moduleMod.deactivate = function () {
                            eventBus.dispose();
                        };
                    }
                    break;
                case SEAModType.SIGN_MOD:
                    {
                        const signMod = mod as BaseMod & { export: Record<string, SignModExport> };
                        // 对导出进行this绑定
                        Object.entries(signMod.export).forEach(([key, { run, check }]) => {
                            signMod.export[key] = {
                                check: check.bind(signMod),
                                run: run.bind(signMod),
                            };
                        });
                    }
                    break;
                case SEAModType.LEVEL_MOD:
                    break;
                case SEAModType.BATTLE_MOD:
                    break;
                case SEAModType.STRATEGY:
                    break;
                case SEAModType.QUICK_ACCESS_PLUGIN:
                    {
                        // this 绑定
                        const plugin = mod as QuickAccessPlugin;
                        plugin.click = plugin.click.bind(plugin);
                        plugin.show && (plugin.show = plugin.show.bind(plugin));
                        plugin.showAsync && (plugin.showAsync = plugin.showAsync.bind(plugin));
                    }
                    break;
            }

            mod.logger = SEAModuleLogger(modNamespace, 'info');
            mod.namespace = modNamespace;

            ModStore.set(modNamespace, mod);

            mod.activate?.();
            log(`加载模组: ${modNamespace}`);
        });
    },

    teardown() {
        ModStore.forEach((mod) => {
            switch (mod.meta.type) {
                case SEAModType.BASE_MOD:
                    break;
                case SEAModType.MODULE_MOD:
                    (mod as ModuleMod).destroy?.();
                    break;
                case SEAModType.SIGN_MOD:
                    break;
                case SEAModType.LEVEL_MOD:
                    break;
                case SEAModType.BATTLE_MOD:
                    break;
                case SEAModType.STRATEGY:
                    break;
                case SEAModType.QUICK_ACCESS_PLUGIN:
                    break;
            }
            try {
                mod.deactivate?.();
                log(`卸载模组: ${mod.meta.id}`);
            } catch (error) {
                console.error(`卸载模组失败: ${mod.meta.id}`, error);
            }
        });
        ModStore.clear();
    },
};

export const loadStrategy = (id: string, scope = 'sa') => {
    const strategyConfig = ModStore.get(`${SEAModType.STRATEGY}::${scope}::${id}`);
    if (!strategyConfig) {
        throw new Error('未找到STRATEGY');
    }
    if (strategyConfig.meta.type !== SEAModType.STRATEGY) {
        throw new Error('该Mod不是STRATEGY类型');
    }
    const strategy = (strategyConfig as StrategyMod).export;
    return strategy;
};

export const loadBattle = async (id: string, scope = 'sa') => {
    const BattleConfig = ModStore.get(`${SEAModType.BATTLE_MOD}::${scope}::${id}`);
    if (!BattleConfig) {
        throw new Error('未找到BATTLE');
    }
    if (BattleConfig.meta.type !== SEAModType.BATTLE_MOD) {
        throw new Error('该Mod不是BATTLE类型');
    }
    const battleExport = (BattleConfig as BattleMod).export;
    return {
        beforeBattle: battleExport.beforeBattle,
        pets: await ct(...battleExport.pets),
        strategy: loadStrategy(battleExport.strategy, scope),
    } satisfies ILevelBattleStrategy;
};

import { createLocalStorageProxy } from '@sea-launcher/utils/LocalStorage';
export const injectModConfig = async (mod: BaseMod) => {
    const { meta } = mod;
    const namespace = `${meta.type}::${meta.scope}::${meta.id}`;
    if (mod.defaultConfig) {
        const serializeConfig = mod.serializeConfig ?? JSON.stringify;
        const { config } = await EndPoints.getModConfig(namespace);
        if (config) {
            const praseConfig = mod.praseConfig;
            mod.config = await createLocalStorageProxy(
                namespace,
                (praseConfig ? praseConfig(config) : config) as object,
                (value) => {
                    EndPoints.setModConfig(namespace, serializeConfig(value));
                }
            );
        } else {
            EndPoints.setModConfig(namespace, serializeConfig(mod.defaultConfig));
            mod.config = await createLocalStorageProxy(namespace, { ...mod.defaultConfig }, (value) => {
                EndPoints.setModConfig(namespace, serializeConfig(value));
            });
        }
    }
};
