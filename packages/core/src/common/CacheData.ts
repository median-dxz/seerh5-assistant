export class CacheData<T> {
    private data: T;
    private available: boolean;
    private updatePromise: Promise<void>;
    private updateResolve: () => void;
    private updater: Function;

    constructor(data: T, updater: Function) {
        this.updater = updater;
        this.deactivate();
        this.update(data);
    }

    deactivate() {
        this.available = false;
        this.updatePromise = new Promise((resolve, reject) => {
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
