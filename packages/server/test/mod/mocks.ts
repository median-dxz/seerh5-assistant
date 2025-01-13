import { Writable } from 'node:stream';
import { vi } from 'vitest';

import { getCompositeId } from '@sea/mod-resolver';

import { type IStorage } from '../../src/shared/utils';

export const CID_LIST = {
    1: getCompositeId({ scope: 'scope1', id: 'mod1' }),
    2: getCompositeId({ scope: 'scope2', id: 'mod2' }),
    3: getCompositeId({ scope: 'scope3', id: 'mod3' }),
    test: getCompositeId({ scope: 'scope_test', id: 'id_test' })
} as const;

export const SOURCE_INDEX = 'index';
export const UID = 'default';

export const storageDelete = vi.fn(async () => {});

export class FakeStorage implements IStorage {
    constructor(public source: string) {}
    data: object | undefined;
    initLoad = true;
    async load(defaultData?: object) {
        if (this.initLoad) {
            this.data = defaultData;
            this.initLoad = false;
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
