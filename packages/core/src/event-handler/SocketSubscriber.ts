import { BaseSubject } from './BaseSubscriber';

export interface SocketSubscriber<T> {
    data?: (data: T) => void;
    cache?: (data: T) => void;
}

type Hook = 'data' | 'cache';
type DataBuilder<T> = (data: ArrayBuffer) => T;
const VoidFunction = () => {};

class SocketSubject<T> extends BaseSubject<SocketSubscriber<T>> {
    cmd: number;
    builder: DataBuilder<T>;

    cache: T | null;

    constructor(cmd: number, builder: DataBuilder<T>) {
        super();
        this.cmd = cmd;
        this.builder = builder;
    }

    get useCache() {
        let r: boolean = true;
        for (const subscriber of this.subscribers) {
            if (subscriber.cache) {
                r = true;
                break;
            }
        }
        if (!r) {
            this.cache = null;
        }
        return r;
    }

    notify(hook: Hook, data: T) {
        this.cache = this.useCache ? data : null;
        this.subscribers.forEach((subscriber) => subscriber[hook]?.(data));
    }
}

export const SocketDataAccess = {
    subjects: new Map<number, SocketSubject<any>>(),

    subscribe<T>(cmd: number, builder: DataBuilder<T>) {
        this.subjects.set(cmd, new SocketSubject<T>(cmd, builder));
        SocketConnection.addCmdListener(cmd, (e: SocketEvent) => {
            const data = new egret.ByteArray((e.data as egret.ByteArray).rawBuffer);
            this.notifyAll(cmd, data);
        });
    },

    getCache<T>(cmd: number) {
        const subject: SocketSubject<T> | undefined = this.subjects.get(cmd);
        return subject?.cache;
    },

    clearCache(cmd: number) {
        const subject = this.subjects.get(cmd);
        if (subject) {
            subject.cache = null;
        }
    },

    attach<T>(subscriber: SocketSubscriber<T>, cmd: number) {
        if (!this.subjects.has(cmd)) {
            return;
        }
        const subject = this.subjects.get(cmd) as SocketSubject<T>;
        subject.attach(subscriber);
    },

    detach<T>(subscriber: SocketSubscriber<T>, cmd: number) {
        if (this.subjects.has(cmd)) {
            const subject = this.subjects.get(cmd) as SocketSubject<T>;
            subject.detach(subscriber);
        }
    },

    notifyAll<T>(cmd: number, buffer: egret.ByteArray) {
        if (!this.subjects.has(cmd)) {
            return;
        }
        const subject = this.subjects.get(cmd) as SocketSubject<T>;
        const data = subject.builder(buffer.buffer);

        subject.notify('data', data);
    },
};

export class SocketListenerBuilder<T> {
    subscriber = {} as SocketSubscriber<T>;
    data(onData: (data: T) => void) {
        this.subscriber.data = onData;
        return this;
    }
    cache(onCache: (data: T) => void = VoidFunction) {
        this.subscriber.cache = onCache;
        return this;
    }

    end(cmd: number) {
        return [this.subscriber, cmd] as const;
    }
}
