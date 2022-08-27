import { defaultStyle, SaModuleLogger } from '../../logger';
import { InfoProvider } from '../battle-module';
import { EVENTS as hooks } from '../const';
import RoundPetInfo from '../entities/roundinfo';

const GlobalEventManager = window.SAEventTarget;
const log = SaModuleLogger('SAEventHandler', defaultStyle.core);

const ModuleLoadedListener = {
    list: new Map(),
    loadingModules: new Set(),
    subscribe(moduleName: string, callback: CallBack) {
        if (!this.list.has(moduleName)) {
            this.list.set(moduleName, []);
        }
        this.list.get(moduleName).push(callback);
    },
    notice(moduleName: string) {
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
        log(`检测到模块加载: ${e.detail.moduleName}`);
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
        log(`获得物品:`);
        const logStr = e.detail.items.map((v: any) => ItemXMLInfo.getName(v.id) + ' ' + v.count);
        log(logStr.join('\r\n'));
    }
});

GlobalEventManager.addEventListener(hooks.BattlePanel.onRoundData, (e) => {
    if (e instanceof CustomEvent) {
        const [fi, si] = [new RoundPetInfo(e.detail.info[0]), new RoundPetInfo(e.detail.info[1])];
        InfoProvider.cachedRoundInfo = [fi, si];
        log(
            `对局信息更新:
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
    InfoProvider.cachedRoundInfo = null;
});

export { ModuleLoadedListener as ModuleListener };
