import { EVENTS as hooks } from './const/_exports.js';
import RoundPetInfo from './entities/roundinfo.js';
import { BattleInfoProvider } from './battle/infoprovider.js';

const GlobalEventManager = window.SAEventManager;

const ModuleLoadedListener = {
    list: new Map(),
    loadingModules: new Set(),
    subscribe(moduleName, callback) {
        if (!this.list.has(moduleName)) {
            this.list.set(moduleName, []);
        }
        this.list.get(moduleName).push(callback);
    },
    notice(moduleName) {
        if (this.list.has(moduleName)) {
            for (let cb of this.list.get(moduleName)) {
                cb();
            }
            this.list.delete(moduleName);
        }
    },
};

GlobalEventManager.addEventListener(hooks.Module.loaded, async (e) => {
    if (e instanceof CustomEvent) {
        console.log(`[EventManager]: 检测到模块加载: ${e.detail.moduleName}`);
        ModuleLoadedListener.loadingModules.add(e.detail.moduleName);
    }
});

GlobalEventManager.addEventListener(hooks.Module.loaded, (e) => {
    if (e instanceof CustomEvent) {
        const name = e.detail.moduleName;
        if (ModuleLoadedListener.loadingModules.has(name)) {
            ModuleLoadedListener.notice(name);
            ModuleLoadedListener.loadingModules.delete(name);
        }
    }
});

GlobalEventManager.addEventListener(hooks.Award.receive, (e) => {
    if (e instanceof CustomEvent) {
        console.log(`[EventManager]: 获得物品:`);
        let logStr = e.detail.items.map((v) => ItemXMLInfo.getName(v.id) + ' ' + v.count);
        console.log(logStr.join('\n'));
    }
});

GlobalEventManager.addEventListener(hooks.BattlePanel.onRoundData, (e) => {
    if (e instanceof CustomEvent) {
        const [fi, si] = [new RoundPetInfo(e.detail.info[0]), new RoundPetInfo(e.detail.info[1])];
        BattleInfoProvider.cachedRoundInfo = [fi, si];
        console.log(
            `[EventManager]: 对局信息更新:
                先手方:${fi.userId}
                hp: ${fi.hp.remain} / ${fi.hp.max}
                是否暴击:${fi.isCrit}
                使用技能: ${SkillXMLInfo.getName(fi.skillId)}
                ===========
                后手方:${si.userId}
                hp: ${si.hp.remain} / ${si.hp.max}
                是否暴击:${si.isCrit}
                使用技能: ${SkillXMLInfo.getName(si.skillId)}
        `
        );
    }
});

GlobalEventManager.addEventListener(hooks.BattlePanel.panelReady, () => {
    BattleInfoProvider.cachedRoundInfo = null;
});

export { ModuleLoadedListener as SAModuleListener };
