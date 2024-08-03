import { test as base } from 'vitest';

import { ModIndex, ModState } from '../../src/configHandlers/ModIndex';
import { InstallModOptions } from '../../src/router/mod/schemas';
import { ModManager } from '../../src/shared/ModManager';
import { CID_LIST, FakeStorage, FakeStorageBuilder, SOURCE_INDEX, storageDelete } from './mocks';

const modState1 = {
    enable: true,
    requireConfig: false,
    requireData: false,
    builtin: true,
    preload: false,
    version: '0.0.1'
} satisfies ModState;

const modState2 = {
    enable: true,
    requireConfig: true,
    requireData: true,
    builtin: false,
    preload: false,
    version: '0.0.1'
} satisfies ModState;

export const installOptions1 = {
    version: '1.0.0',
    config: { key: 'value' },
    data: { key: 'value' },
    update: false
} satisfies InstallModOptions;

export const installOptions2 = {
    version: '1.0.0',
    config: { key: 'new value' },
    data: { key: 'new value' },
    update: true
} satisfies InstallModOptions;

const test = base.extend<{
    modManager: ModManager;
}>({
    modManager: async ({}, use) => {
        const modIndex = new ModIndex(new FakeStorage(SOURCE_INDEX));
        const modManager = new ModManager(modIndex, FakeStorageBuilder, FakeStorageBuilder);

        // insert mock data
        modIndex.create(
            new Map([
                [CID_LIST[1], modState1 as ModState],
                [CID_LIST[2], modState2 as ModState]
            ])
        );
        await modManager.init();

        use(modManager);
    }
});

test('load config and data', async ({ expect, modManager }) => {
    const cid = CID_LIST[2];
    expect(modManager.dataHandlers.size).toBe(1);
    expect(modManager.configHandlers.size).toBe(1);
    expect(await modManager.data(cid)).toEqual({ key: 'value' });
    expect(await modManager.config(cid)).toEqual({ key: 'value' });
});

test('install a new mod with config and data', async ({ expect, modManager }) => {
    const cid = CID_LIST[3];

    await modManager.install(cid, installOptions1);
    expect(modManager.index.state(cid)).toEqual({
        version: '1.0.0',
        builtin: false,
        preload: false,
        enable: true,
        requireConfig: true,
        requireData: true
    });
    expect(await modManager.data(cid)).toEqual({ key: 'value' });
    expect(await modManager.config(cid)).toEqual({ key: 'value' });
});

test('update a mod, should not change the data and config', async ({ expect, modManager }) => {
    const cid = CID_LIST[3];

    await modManager.install(cid, installOptions1);
    await modManager.install(cid, installOptions2);

    expect(await modManager.data(cid)).toEqual({ key: 'value' });
    expect(await modManager.config(cid)).toEqual({ key: 'value' });
});

test('install a mod that already exist', async ({ expect, modManager }) => {
    const cid = CID_LIST[3];

    await modManager.install(cid, installOptions1);
    try {
        await modManager.install(cid, { ...installOptions2, update: false });
    } catch (error) {
        expect((error as Error).message).toBe('there has existed a mod with the same id and scope already');
    }
});

test('uninstall a mod', async ({ expect, modManager }) => {
    const cid = CID_LIST[3];
    await modManager.install(cid, installOptions1);

    storageDelete.mockClear();
    await modManager.uninstall(cid);

    expect(modManager.index.state(cid)).toBeUndefined();
    expect(await modManager.data(cid)).toBeUndefined();
    expect(await modManager.config(cid)).toBeUndefined();

    expect(storageDelete).toHaveBeenCalledTimes(2);
});
