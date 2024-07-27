import { afterAll, test, vi } from 'vitest';

import FormData from 'form-data';
import { createWriteStream } from 'node:fs';
import path from 'node:path';

import superjson from 'superjson';

import { ModIndex } from '../../src/configHandlers/ModIndex';
import { ModManager } from '../../src/router/mod/manager';
import type { InstallModOptions } from '../../src/router/mod/schemas';
import { modUploadAndInstallRouter } from '../../src/router/mod/uploadAndInstall';
import { createServer } from '../../src/server';
import { praseCompositeId } from '../../src/shared';

import { modsRoot } from '../../src/paths';
import { CID_LIST, FakeStorage, FakeStorageBuilder, FakeWriteStream } from './mocks';

const modIndex = new ModIndex(new FakeStorage('index'));
const modManager = new ModManager(modIndex, FakeStorageBuilder, FakeStorageBuilder);

const { server, stop } = await createServer();
await server.register(modUploadAndInstallRouter, { modManager, prefix: '/test' });

vi.mock('fs', async (importOriginal) => {
    const module = await importOriginal<typeof import('fs')>();
    return {
        ...module,
        createWriteStream: vi.fn(() => new FakeWriteStream())
    };
});

const installSpy = vi.spyOn(modManager, 'install');
installSpy.mockImplementation(() => Promise.resolve({ success: true }));

const { scope, id } = praseCompositeId(CID_LIST['test']);
const cid = CID_LIST['test'];
const filename = `${scope}.${id}.js`;
const contentType = 'application/javascript';

afterAll(async () => {
    vi.restoreAllMocks();
    await stop();
});

test('no querying string', async ({ expect }) => {
    const data = new FormData();
    data.append('mod', Buffer.from('test'), {
        filename,
        contentType
    });
    data.append('options', JSON.stringify({}), { contentType: 'application/json' });

    const response = await server.inject({
        method: 'POST',
        url: '/test/api/mods/install',
        payload: data,
        headers: data.getHeaders()
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe('FST_ERR_VALIDATION');
});

test('no options', async ({ expect }) => {
    const data = new FormData();
    data.append('mod', Buffer.from('test'), {
        filename,
        contentType
    });

    const response = await server.inject({
        method: 'POST',
        url: { pathname: '/test/api/mods/install', query: { cid } },
        payload: data,
        headers: data.getHeaders()
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe('FST_ERR_VALIDATION');
});

test('no mod file', async ({ expect }) => {
    const data = new FormData();
    data.append('options', JSON.stringify({ version: '1.0.0' } as InstallModOptions), {
        contentType: 'application/json'
    });
    vi.mocked(createWriteStream).mockClear();

    const response = await server.inject({
        method: 'POST',
        url: `/test/api/mods/install?${new URLSearchParams({ cid: 'test_scope::test' }).toString()}`,
        payload: data,
        headers: data.getHeaders()
    });

    expect(response.statusCode).toBe(200);
    expect(createWriteStream).not.toHaveBeenCalled();
});

test('install mod', async ({ expect }) => {
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
        url: { pathname: '/test/api/mods/install', query: { cid } },
        payload: data,
        headers: data.getHeaders()
    });

    // assert
    expect(response.statusCode).toBe(200);
    expect(modManager.install).toHaveBeenCalledOnce();
    expect(modManager.install).toHaveBeenCalledWith(cid, options);
    expect(createWriteStream).toHaveBeenCalledOnce();
    expect(createWriteStream).toHaveBeenCalledWith(path.join(server.config.APP_ROOT, modsRoot, filename));
});
