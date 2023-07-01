import * as SAEndPoint from '@sa-app/service/endpoints';
import { SaModuleLogger, defaultStyle } from 'sa-core';
import { GameModuleListener } from 'sa-core/event-bus';
import { BaseMod, ModuleMod, QuickAccessPlugin, SAModType, SignModExport } from './type';

const log = SaModuleLogger('SAModManager', defaultStyle.mod);

export const ModStore = new Map<string, BaseMod>();

type ModModuleExport = typeof BaseMod | Array<typeof BaseMod>;

export const SAModManager = {
    async fetchMods() {
        const modList = await SAEndPoint.getAllMods();
        const promises = modList.map(({ path }) =>
            import(/* @vite-ignore */ `/mods/${path}`)
                .then((module) => module.default as ModModuleExport)
                .then((mod) => {
                    if (Array.isArray(mod)) {
                        return mod.map((m) => new m());
                    } else {
                        return new mod();
                    }
                })
        );
        return Promise.all(promises).then((mods) => mods.flat());
    },

    setup(mods: BaseMod[]) {
        mods.forEach((mod) => {
            const { meta } = mod;
            const modNamespace = `${meta.type}::${meta.author}::${meta.id}`;

            switch (meta.type) {
                case SAModType.BASE_MOD:
                    break;
                case SAModType.MODULE_MOD:
                    {
                        const moduleMod = mod as ModuleMod;
                        moduleMod.activate = function () {
                            this.subscriber = {
                                moduleName: this.moduleName,
                                load: this.load?.bind(this),
                                show: this.show?.bind(this),
                                mainPanel: this.mainPanel?.bind(this),
                                destroy: this.destroy?.bind(this),
                            };

                            GameModuleListener.on(this.subscriber);
                        };

                        moduleMod.deactivate = function () {
                            GameModuleListener.off(this.subscriber);
                        };
                    }
                    break;
                case SAModType.SIGN_MOD:
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
                case SAModType.LEVEL_MOD:
                    break;
                case SAModType.BATTLE_MOD:
                    break;
                case SAModType.STRATEGY:
                    break;
                case SAModType.QUICK_ACCESS_PLUGIN:
                    {
                        // this 绑定
                        const plugin = mod as QuickAccessPlugin;
                        plugin.click = plugin.click.bind(plugin);
                        plugin.show && (plugin.show = plugin.show.bind(plugin));
                        plugin.showAsync && (plugin.showAsync = plugin.showAsync.bind(plugin));
                    }
                    break;
            }
            SAEndPoint.injectModConfig(mod);
            mod.logger = SaModuleLogger(modNamespace, defaultStyle.mod);
            mod.namespace = modNamespace;

            ModStore.set(modNamespace, mod);

            mod.activate?.();
            log(`加载模组: ${modNamespace}`);
        });
    },

    teardown() {
        ModStore.forEach((mod) => {
            switch (mod.meta.type) {
                case SAModType.BASE_MOD:
                    break;
                case SAModType.MODULE_MOD:
                    (mod as ModuleMod).destroy?.();
                    break;
                case SAModType.SIGN_MOD:
                    break;
                case SAModType.LEVEL_MOD:
                    break;
                case SAModType.BATTLE_MOD:
                    break;
                case SAModType.STRATEGY:
                    break;
                case SAModType.QUICK_ACCESS_PLUGIN:
                    break;
            }
            mod.deactivate?.();
            log(`卸载模组: ${mod.meta.id}`);
        });
        ModStore.clear();
    },
};
