import { BaseSubject } from './BaseSubscriber';

import { SeerModuleHelper } from '../engine';

import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('SAModuleListener', defaultStyle.core);

export interface ModuleSubscriber<T extends BaseModule> {
    load?(): void;
    show?(ctx: T): void;
    destroy?(ctx: T): void;
}

type ModuleState = 'load' | 'show' | 'destroy';

class ModuleSubject<T extends BaseModule> extends BaseSubject<ModuleSubscriber<T>> {
    state: ModuleState;
    module?: T;
    constructor() {
        super();
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
}

export const SeerModuleStatePublisher = {
    subjects: new Map<string, ModuleSubject<BaseModule>>(),
    attach<T extends BaseModule>(subscriber: ModuleSubscriber<T>, moduleName: string) {
        if (!this.subjects.has(moduleName)) {
            this.subjects.set(moduleName, new ModuleSubject<T>());
        }
        const subject = this.subjects.get(moduleName)!;
        subject.attach(subscriber);
    },

    detach<T extends BaseModule>(subscriber: ModuleSubscriber<T>, moduleName: string) {
        if (this.subjects.has(moduleName)) {
            const subject = this.subjects.get(moduleName)!;
            subject.detach(subscriber);
        }
    },

    notifyAll<T extends BaseModule>(name: string, hook: ModuleState) {
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
