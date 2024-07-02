import { afterAll, describe, expect, test, vi } from 'vitest';

import FormData from 'form-data';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { modsRoot } from '../../src/paths';
import { ModManager, type ModInstallOptions } from '../../src/router/mod/manager';
import { createServer } from '../../src/server';

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
        expect(response.json()).toEqual({
            statusCode: 400,
            code: 'FST_ERR_VALIDATION',
            error: 'Bad Request',
            message: JSON.stringify(
                [
                    {
                        code: 'invalid_type',
                        expected: 'string',
                        received: 'undefined',
                        path: ['scope'],
                        message: 'Required'
                    },
                    {
                        code: 'invalid_type',
                        expected: 'string',
                        received: 'undefined',
                        path: ['id'],
                        message: 'Required'
                    }
                ],
                undefined,
                2
            )
        });
    });

    test('no options', async () => {
        const data = new FormData();
        data.append('mod', Buffer.from('test'), {
            filename,
            contentType
        });

        const response = await server.inject({
            method: 'POST',
            url: { pathname: '/api/mods/install', query: { id, scope } },
            payload: data,
            headers: data.getHeaders()
        });
        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            statusCode: 400,
            code: 'FST_ERR_VALIDATION',
            error: 'Bad Request',
            message: JSON.stringify(
                [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        received: 'undefined',
                        path: ['options'],
                        message: 'Required'
                    }
                ],
                undefined,
                2
            )
        });
    });

    test('no mod file', async () => {
        const data = new FormData();
        data.append('options', JSON.stringify({}), { contentType: 'application/json' });
        vi.mocked(createWriteStream).mockClear();

        const response = await server.inject({
            method: 'POST',
            url: '/api/mods/install?id=test&scope=test',
            payload: data,
            headers: data.getHeaders()
        });
        expect(response.statusCode).toBe(200);
        expect(createWriteStream).not.toHaveBeenCalled();
    });

    test('install mod', async () => {
        vi.clearAllMocks();

        // data
        const options: ModInstallOptions = {
            builtin: false,
            config: {},
            data: {},
            preload: false,
            update: false
        };
        const data = new FormData();
        data.append('mod', Buffer.from('test'), {
            filename,
            contentType
        });
        data.append('options', JSON.stringify(options), { contentType: 'application/json' });

        // action
        const response = await server.inject({
            method: 'POST',
            url: { pathname: '/api/mods/install', query: { id, scope } },
            payload: data,
            headers: data.getHeaders()
        });

        // assert
        expect(response.statusCode).toBe(200);
        expect(ModManager.install).toHaveBeenCalledOnce();
        expect(ModManager.install).toHaveBeenCalledWith(scope, id, options);
        expect(createWriteStream).toHaveBeenCalledOnce();
        expect(createWriteStream).toHaveBeenCalledWith(path.join(server.config.APP_ROOT, modsRoot, filename));
    });
});
