import { SAEventTarget } from '../common';
import { Hook } from '../constant/event-hooks';
import { BaseSubject } from './BaseSubscriber';

export interface SocketSubscriber<T> {
    response?: (data: T) => void;
    request?: (data: SAType.SocketRequestData) => void;
    cache: any;
}

type Hook = 'request' | 'response' | 'cache';
type DataBuilder<T> = (data: ArrayBuffer) => T;
const VoidFunction = <T = null>() => null as T;
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

    notify(hook: Hook, data: SAType.SocketRequestData | T | null) {
        if (hook === 'request') {
            this.subscribers.forEach((subscriber) => subscriber[hook]?.(data as SAType.SocketRequestData));
        } else if (hook === 'response') {
            this.cache = this.useCache ? (data as T) : null;
            this.subscribers.forEach((subscriber) => subscriber[hook]?.(data as T));
        }
    }
}

export const SocketDataAccess = {
    subjects: new Map<number, SocketSubject<any>>(),

    subscribe<T = null>(cmd: number, builder: DataBuilder<T> = VoidFunction) {
        this.subjects.set(cmd, new SocketSubject<T>(cmd, builder));
        SocketConnection.addCmdListener(cmd, (e: SocketEvent) => {
            let data = null;
            if (e.data) {
                data = new egret.ByteArray((e.data as egret.ByteArray).rawBuffer);
            }
            this.onResponse(cmd, data);
        });
    },

    getCache<T>(cmd: number) {
        const subject: SocketSubject<T> | undefined = this.subjects.get(cmd);
        return subject?.cache;
    },

    attach<T>({ subscriber, cmd }: { subscriber: SocketSubscriber<T>; cmd: number }) {
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

    onResponse<T>(cmd: number, bytes: egret.ByteArray | null) {
        if (!this.subjects.has(cmd)) {
            return;
        }
        const subject = this.subjects.get(cmd) as SocketSubject<T>;
        let data = null;
        if (bytes) {
            data = subject.builder(bytes.buffer);
        }
        subject.notify('response', data);
    },

    onRequest(cmd: number, data: SAType.SocketRequestData) {
        if (!this.subjects.has(cmd)) {
            return;
        }
        const subject = this.subjects.get(cmd)!;
        subject.notify('request', data);
    },
};

SAEventTarget.addEventListener(Hook.Socket.send, (e) => {
    if (e instanceof CustomEvent) {
        const { cmd, data }: { cmd: number; data: SAType.SocketRequestData } = e.detail;
        SocketDataAccess.onRequest(cmd, data);
    }
});

export class SocketListenerBuilder<T> {
    subscriber = {} as SocketSubscriber<T>;
    cmd: number;

    constructor(cmd: number) {
        this.cmd = cmd;
    }

    req(onReq: (data: SAType.SocketRequestData) => void) {
        this.subscriber.request = onReq;
        return this;
    }

    res(onRes: (data: T) => void) {
        this.subscriber.response = onRes;
        return this;
    }

    cache(onCache: (data: T) => void = VoidFunction) {
        this.subscriber.cache = onCache;
        return this;
    }
}
