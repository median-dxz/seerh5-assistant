import { afterAll, test, vi } from 'vitest';

import FormData from 'form-data';
import path from 'node:path';
import superjson from 'superjson';

import { praseCompositeId } from '@sea/mod-resolver';

import { ModIndex } from '../../src/configHandlers/ModIndex';
import { ModManager } from '../../src/shared/ModManager';

import type { InstallModOptions } from '../../src/router/mod/schemas';
import { modUploadAndInstallRouter } from '../../src/router/mod/uploadAndInstall';

import { createServer } from '../../src/server';

import { CID_LIST, FakeStorage, FakeStorageBuilder, FakeWriteStream } from './mocks';

const modIndex = new ModIndex(new FakeStorage('index'));
const modManager = new ModManager(modIndex, FakeStorageBuilder, FakeStorageBuilder);
const modFileHandler = {
    buildPath: vi.fn((filename: string) => filename),
    remove: () => {},
    root: ''
};

const { server, stop } = await createServer();
await server.register(modUploadAndInstallRouter, {
    modFileHandler,
    modManager,
    prefix: '/test'
});

const installSpy = vi.spyOn(modManager, 'install');
installSpy.mockImplementation(() => undefined);

const { scope, id } = praseCompositeId(CID_LIST['test']);
const cid = CID_LIST['test'];
const filename = `${scope}.${id}.js`;
const contentType = 'application/javascript';

afterAll(async () => {
    vi.restoreAllMocks();
    await stop();
});

vi.mock('fs', async (importOriginal) => {
    const module = await importOriginal<typeof import('fs')>();
    return {
        ...module,
        createWriteStream: vi.fn(() => new FakeWriteStream())
    };
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
    vi.mocked(modFileHandler.buildPath).mockClear();

    const response = await server.inject({
        method: 'POST',
        url: `/test/api/mods/install?${new URLSearchParams({ cid: 'test_scope::test' }).toString()}`,
        payload: data,
        headers: data.getHeaders()
    });

    expect(response.statusCode).toBe(200);
    expect(modFileHandler.buildPath).not.toHaveBeenCalled();
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
    expect(modFileHandler.buildPath).toHaveBeenCalledOnce();
    expect(modFileHandler.buildPath).toHaveBeenCalledWith(path.join(filename));
});
