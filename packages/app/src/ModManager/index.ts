import { injectModConfig } from '@sa-app/utils/SADataProvider';
import { SaModuleLogger, defaultStyle } from 'sa-core';
import { GameModuleListener } from 'sa-core/event-bus';
import { BaseMod, ModuleMod, SAModType } from './type';

const log = SaModuleLogger('SAModManager', defaultStyle.mod);

export const ModStore = new Map<string, BaseMod>();

type ModList = Array<{ path: string }>;
type ModModuleExport = typeof BaseMod | Array<typeof BaseMod>;

export const SAModManager = {
    async fetchMods() {
        const modList: ModList = await fetch('/api/mods').then((res) => res.json());
        const promises = modList.map((url) =>
            import(/* @vite-ignore */ `/api/mods/${url}`)
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
                    if (mod.defaultConfig) {
                        mod.config = injectModConfig(modNamespace, mod.defaultConfig);
                    }
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
            mod.logger = SaModuleLogger(modNamespace, defaultStyle.mod);

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
