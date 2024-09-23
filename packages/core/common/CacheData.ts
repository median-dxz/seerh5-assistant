import { NOOP } from './utils.js';

export class CacheData<T> {
    private data: T;
    private available: boolean;
    private updatePromise: Promise<void>;
    private updateResolve: () => void;
    private updater: () => void;

    constructor(data: T, updater: () => void) {
        this.updater = updater;
        this.updateResolve = NOOP;
        this.updatePromise = Promise.resolve();
        this.data = data;
        this.available = true;
    }

    deactivate() {
        if (this.available) {
            this.available = false;
            const { promise, resolve } = Promise.withResolvers<void>();
            this.updatePromise = promise;
            this.updateResolve = resolve;
        }
        // 否则, 说明缓存已经失效, 此时不能更新 updatePromise 与 updateResolver
    }

    update(data: T) {
        this.data = data;
        this.available = true;
        this.updateResolve();
    }

    async get() {
        if (!this.available) {
            this.updater();
            await this.updatePromise;
        }
        return this.data;
    }

    getImmediate() {
        return this.data;
    }
}
