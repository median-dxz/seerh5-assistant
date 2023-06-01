export class CacheData<T> {
    private data: T;
    private available: boolean;
    private updatePromise: Promise<void>;
    private updateResolve: () => void;
    private updater: () => void;

    constructor(data: T, updater: () => void) {
        this.updater = updater;
        this.deactivate();
        this.update(data);
    }

    deactivate() {
        this.available = false;
        this.updatePromise = new Promise((resolve) => {
            this.updateResolve = resolve;
        });
    }

    update(data: T) {
        this.data = data;
        this.available = true;
        this.updateResolve();
    }

    async get() {
        if (!this.available) {
            this.updater();
        }
        await this.updatePromise;
        return this.data;
    }

    getImmediate() {
        return this.data;
    }
}
