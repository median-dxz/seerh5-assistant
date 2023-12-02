import * as EndPoints from '../endpoints';
import { buildMeta, createModContext } from './context';
import { SEAModInstance } from './type';

type Mod = SEAL.ModExport;
type ModModuleExport = (createContext: typeof createModContext) => Promise<Mod>;

export const SEAModManager = {
    store: new Map<string, SEAModInstance>(),

    async fetchMods() {
        const modList = await EndPoints.getAllMods();

        const promises = modList.map(({ path }) =>
            import(/* @vite-ignore */ `/mods/${path}?r=${Math.random()}`)
                .then((module) => module.default as ModModuleExport)
                .then((mod) => mod(createModContext))
        );

        // builtin strategy
        promises.push(
            import('@/builtin/strategy')
                .then((module) => module.default as ModModuleExport)
                .then((mod) => mod(createModContext))
        );

        return Promise.all(promises);
    },

    setup({ install, uninstall, meta, exports }: Mod) {
        // 确保meta合法
        meta = buildMeta(meta);

        const ins = new SEAModInstance(meta);

        // 执行副作用
        try {
            ins.setUninstall(uninstall);
            install?.();
            console.log(`模组安装中: ${ins.meta.namespace}`);
        } catch (error) {
            console.error(`模组安装失败: ${ins.meta.namespace}`, error);
        }

        // 加载导出的策略
        ins.tryRegisterStrategy(exports?.strategy);

        this.store.set(ins.meta.namespace, ins);
    },

    teardown() {
        this.store.forEach((mod) => {
            try {
                mod.dispose();
                console.log(`卸载模组: ${mod.meta.namespace}`);
            } catch (error) {
                console.error(`模组卸载失败: ${mod.meta.namespace}`, error);
            }
        });
    },
};

// try {
//     mod.deactivate?.();
//     // log(`卸载模组: ${mod.meta.id}`);
// } catch (error) {
//     console.error(`卸载模组失败: ${mod.meta.id}`, error);
// }

// const subscription = new Subscription();
// const $module = DataSource.gameModule;

// moduleMod.activate = function () {
//     if (this.load) {
//         subscription.on($module(this.moduleName, 'load'), this.load.bind(this));
//     }
//     if (this.show) {
//         subscription.on($module(this.moduleName, 'show'), this.show.bind(this));
//     }
//     if (this.mainPanel) {
//         subscription.on($module(this.moduleName, 'mainPanel'), this.mainPanel.bind(this));
//     }
//     if (this.destroy) {
//         subscription.on($module(this.moduleName, 'destroy'), this.destroy.bind(this));
//     }
// };
// moduleMod.deactivate = function () {
//     subscription.dispose();
// };
