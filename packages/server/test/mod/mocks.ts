import { Writable } from 'node:stream';
import { vi } from 'vitest';

import { getCompositeId, type IStorage } from '../../src/shared/utils';

export const CID_LIST = {
    1: getCompositeId('scope1', 'mod1'),
    2: getCompositeId('scope2', 'mod2'),
    3: getCompositeId('scope3', 'mod3'),
    test: getCompositeId('scope_test', 'mod_test')
} as const;

export const SOURCE_INDEX = 'index';

export const storageDelete = vi.fn(async () => {});

export class FakeStorage implements IStorage {
    constructor(public source: string) {}
    data: object | undefined;
    async load(defaultData?: object) {
        if (!this.data) {
            if (defaultData) {
                this.data = defaultData;
            } else if (this.source === CID_LIST[1] || this.source === CID_LIST[2]) {
                this.data = { key: 'value' };
            } else {
                throw new Error('should set default data');
            }
        }
        return this.data;
    }
    async save(data?: object) {
        this.data = data;
    }
    delete = storageDelete;
}
export const FakeStorageBuilder = (cid: string) => new FakeStorage(cid);

export class FakeWriteStream extends Writable {
    dataWritten: string[] = [];

    constructor(options = {}) {
        super(options);
    }

    _write(chunk: any, encoding: string, callback: () => void) {
        this.dataWritten.push(chunk.toString());
        callback();
    }

    getDataWritten() {
        return this.dataWritten;
    }
}
