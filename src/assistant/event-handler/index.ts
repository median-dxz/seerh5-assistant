import { InfoProvider } from '../battle';
import { EVENTS as hooks } from '../const';
import RoundPetInfo from '../entities/roundinfo';
import { defaultStyle, SaModuleLogger } from '../logger';

const GlobalEventManager = window.SAEventTarget;
const log = SaModuleLogger('SAEventHandler', defaultStyle.core);

export interface ModuleSubscriber<T extends BasicMultPanelModule> {
    load?(): void;
    show?(ctx: T): void;
    destroy?(ctx: T): void;
}

type ModuleState = 'load' | 'show' | 'destroy';

class ModuleSubject<T extends BasicMultPanelModule> {
    state: ModuleState;
    module?: T;
    subscribers: Set<ModuleSubscriber<T>> = new Set();
    constructor() {
        this.state = 'destroy';
    }
    notify(hook: ModuleState) {
        const moduleObj = this.module;

        if (hook === 'load') {
            this.subscribers.forEach((subscriber) => subscriber.load?.());
        } else if (moduleObj) {
            this.subscribers.forEach((subscriber) => subscriber[hook]?.(moduleObj));
        }
    }
    attach(subscriber: ModuleSubscriber<T>) {
        if (!this.subscribers.has(subscriber)) {
            this.subscribers.add(subscriber);
        }
    }
    detach(subscriber: ModuleSubscriber<T>) {
        if (this.subscribers.has(subscriber)) {
            this.subscribers.delete(subscriber);
        }
    }
}

const SeerModuleStatePublisher = {
    subjects: new Map<string, ModuleSubject<BasicMultPanelModule>>(),
    attach<T extends BasicMultPanelModule>(subscriber: ModuleSubscriber<T>, moduleName: string) {
        const exist = this.subjects.has(moduleName);
        if (!exist) {
            this.subjects.set(moduleName, new ModuleSubject<T>());
        }
        const subject = this.subjects.get(moduleName)!;
        subject.attach(subscriber);
    },

    detach<T extends BasicMultPanelModule>(subscriber: ModuleSubscriber<T>, moduleName: string) {
        if (this.subjects.has(moduleName)) {
            const subject = this.subjects.get(moduleName)!;
            subject.detach(subscriber);
        }
    },

    notifyAll<T extends BasicMultPanelModule>(name: string, hook: ModuleState) {
        if (!this.subjects.has(name)) {
            this.subjects.set(name, new ModuleSubject<T>());
        }
        const subject = this.subjects.get(name)!;
        subject.state = hook;

        if (hook === 'show') {
            subject.module = SeerModuleHelper.currentModule<T>();
        }

        subject.notify(hook);

        if (hook === 'destroy') {
            subject.module = undefined;
        }
    },
};

const SeerModuleHelper = {
    currentModule<T extends BasicMultPanelModule>() {
        return ModuleManager.currModule as T;
    },
    isConcreteModule<T extends BasicMultPanelModule>(name: string, module: BasicMultPanelModule): module is T {
        return module.name === name;
    },
};

GlobalEventManager.addEventListener(hooks.Module.loadScript, (e) => {
    if (e instanceof CustomEvent) {
        log(`检测到新模块加载: ${e.detail}`);
        const name = e.detail;
        SeerModuleStatePublisher.notifyAll(name, 'load');
    }
});

GlobalEventManager.addEventListener(hooks.Module.construct, (e) => {
    if (e instanceof CustomEvent) {
        const name = e.detail;
        SeerModuleStatePublisher.notifyAll(name, 'show');
    }
});

GlobalEventManager.addEventListener(hooks.Module.destroy, (e) => {
    if (e instanceof CustomEvent) {
        const name = e.detail;
        SeerModuleStatePublisher.notifyAll(name, 'destroy');
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
                造成伤害: ${fi.damage}
                是否暴击:${fi.isCrit}
                使用技能: ${SkillXMLInfo.getName(fi.skillId)}
                ===========
                后手方:${si.userId}
                hp: ${si.hp.remain} / ${si.hp.max}
                造成伤害: ${si.damage}
                是否暴击:${si.isCrit}
                使用技能: ${SkillXMLInfo.getName(si.skillId)}
        `
        );
    }
});

GlobalEventManager.addEventListener(hooks.BattlePanel.panelReady, () => {
    InfoProvider.cachedRoundInfo = null;
    log(`检测到对战开始`);
});

GlobalEventManager.addEventListener(hooks.BattlePanel.completed, (e: Event) => {
    if (e instanceof CustomEvent) {
        log(`检测到对战结束 对战胜利: ${e.detail.isWin}`);
    }
});

export { SeerModuleStatePublisher, SeerModuleHelper };

