import { afterAll, describe, expect, test, vi } from 'vitest';

import FormData from 'form-data';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import superjson from 'superjson';
import { modsRoot } from '../../src/paths';
import { ModManager } from '../../src/router/mod/manager';
import { InstallModOptions } from '../../src/router/mod/schemas';
import { createServer } from '../../src/server';
import { getCompositeId } from '../../src/shared';

const { server } = await createServer();

class FakeWriteStream extends Writable {
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

describe('uploadAndInstall', () => {
    vi.mock('fs', async (importOriginal) => {
        const module = await importOriginal<typeof import('fs')>();
        return {
            ...module,
            createWriteStream: vi.fn(() => new FakeWriteStream())
        };
    });

    const installSpy = vi.spyOn(ModManager, 'install');
    installSpy.mockImplementation(() => Promise.resolve({ success: true }));

    const scope = 'scope_test';
    const id = 'id_test';
    const cid = getCompositeId(scope, id);
    const filename = `${scope}.${id}.js`;
    const contentType = 'application/javascript';

    afterAll(async () => {
        vi.restoreAllMocks();
        await server.close();
    });

    test('no querying string', async () => {
        const data = new FormData();
        data.append('mod', Buffer.from('test'), {
            filename,
            contentType
        });
        data.append('options', JSON.stringify({}), { contentType: 'application/json' });

        const response = await server.inject({
            method: 'POST',
            url: '/api/mods/install',
            payload: data,
            headers: data.getHeaders()
        });
        expect(response.statusCode).toBe(400);
        expect(response.json().code).toBe('FST_ERR_VALIDATION');
    });

    test('no options', async () => {
        const data = new FormData();
        data.append('mod', Buffer.from('test'), {
            filename,
            contentType
        });

        const response = await server.inject({
            method: 'POST',
            url: { pathname: '/api/mods/install', query: { cid } },
            payload: data,
            headers: data.getHeaders()
        });
        expect(response.statusCode).toBe(400);
        expect(response.json().code).toBe('FST_ERR_VALIDATION');
    });

    test('no mod file', async () => {
        const data = new FormData();
        data.append('options', JSON.stringify({ version: '1.0.0' } as InstallModOptions), {
            contentType: 'application/json'
        });
        vi.mocked(createWriteStream).mockClear();

        const response = await server.inject({
            method: 'POST',
            url: `/api/mods/install?${new URLSearchParams({ cid: 'test_scope::test' }).toString()}`,
            payload: data,
            headers: data.getHeaders()
        });

        expect(response.statusCode).toBe(200);
        expect(createWriteStream).not.toHaveBeenCalled();
    });

    test('install mod', async () => {
        vi.clearAllMocks();

        // data
        const options: InstallModOptions = {
            version: '1.0.0',
            builtin: false,
            config: {},
            data: {
                nonSerializedData: new Map()
            },
            preload: false,
            update: false
        };
        const data = new FormData();
        data.append('mod', Buffer.from('test'), {
            filename,
            contentType
        });
        data.append('options', JSON.stringify({ ...options, data: superjson.stringify(options.data) }), {
            contentType: 'application/json'
        });

        // action
        const response = await server.inject({
            method: 'POST',
            url: { pathname: '/api/mods/install', query: { cid } },
            payload: data,
            headers: data.getHeaders()
        });

        // assert
        expect(response.statusCode).toBe(200);
        expect(ModManager.install).toHaveBeenCalledOnce();
        expect(ModManager.install).toHaveBeenCalledWith(cid, options);
        expect(createWriteStream).toHaveBeenCalledOnce();
        expect(createWriteStream).toHaveBeenCalledWith(path.join(server.config.APP_ROOT, modsRoot, filename));
    });
});
