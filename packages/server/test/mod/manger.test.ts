import { beforeEach, describe, expect, test, vi } from 'vitest';
import { modIndexes } from '../../src/data/ModIndexes';

import superjson from 'superjson';
import type { ModState } from '../../src/data/ModIndexes';
import { ModManager } from '../../src/router/mod/manager';
import type { InstallModOptions } from '../../src/router/mod/schemas';
import { getCompositeId } from '../../src/shared';

const modState1: ModState = {
    enable: true,
    requireConfig: false,
    requireData: false,
    builtin: true,
    preload: false,
    version: '0.0.1'
};

const modState2: ModState = {
    enable: true,
    requireConfig: true,
    requireData: true,
    builtin: false,
    preload: false,
    version: '0.0.1'
};

const installOptions1: InstallModOptions = {
    version: '1.0.0',
    config: { key: 'value' },
    data: { key: 'value' },
    update: false
};

const installOptions2: InstallModOptions = {
    version: '1.0.0',
    config: { key: 'new value' },
    data: { key: 'new value' },
    update: true
};

vi.mock('node:fs/promises', async (importOriginal) => {
    const module = await importOriginal<typeof import('fs')>();
    const mockedFsPromise = {
        writeFile: vi.fn(() => Promise.resolve()),
        readFile: vi.fn((path: string) => {
            const kvData = Promise.resolve(superjson.stringify({ key: 'value' }));
            switch (path) {
                case '\\mods\\scope2.mod2.data.json':
                case '\\configs\\mods\\scope2.mod2.json':
                    return kvData;
                case '\\modIndexes':
                    return Promise.resolve(
                        superjson.stringify(
                            new Map([
                                [getCompositeId('scope1', 'mod1'), modState1],
                                [getCompositeId('scope2', 'mod2'), modState2]
                            ])
                        )
                    );
                default:
                    console.log(path);
                    return Promise.resolve('');
            }
        }),
        open: vi.fn(() => Promise.resolve({ close: () => Promise.resolve() }))
    };
    return {
        ...module,
        default: { ...mockedFsPromise },
        mockedFsPromise
    };
});

vi.spyOn(modIndexes, 'set');

describe.sequential('mod manager', () => {
    beforeEach(async () => {
        ModManager.modData.clear();
        ModManager.modConfig.clear();
        await modIndexes.loadWithDefault('\\modIndexes');
        await ModManager.init('\\');
    });

    const scope = 'scope3';
    const id = 'mod3';
    const cid = getCompositeId(scope, id);

    test('load config and data', () => {
        expect(ModManager.modData.size).toBe(1);
        expect(ModManager.modConfig.size).toBe(1);

        const cid = getCompositeId('scope2', 'mod2');
        const data = ModManager.modData.get(cid);
        const config = ModManager.modConfig.get(cid);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('install a new mod with config and data', async () => {
        const installOptions: InstallModOptions = {
            version: '1.0.0',
            config: { key: 'value' },
            data: { key: 'value' },
            update: false
        };

        const result = await ModManager.install(cid, installOptions);
        expect(result).toEqual({ success: true });
        expect(modIndexes.set).toHaveBeenLastCalledWith(cid, {
            version: '1.0.0',
            builtin: false,
            preload: false,
            enable: true,
            requireConfig: true,
            requireData: true
        });

        const data = ModManager.modData.get(cid);
        const config = ModManager.modConfig.get(cid);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('update a mod, should not change the data and config', async () => {
        await ModManager.install(cid, installOptions1);
        const result = await ModManager.install(cid, installOptions2);
        expect(result).toEqual({ success: true });

        const data = ModManager.modData.get(cid);
        const config = ModManager.modConfig.get(cid);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('install a mod that already exist', async () => {
        await ModManager.install(cid, installOptions1);
        const result = await ModManager.install(cid, { ...installOptions2, update: false });
        expect(result).toEqual({
            success: false,
            reason: 'there has existed a mod with the same id and scope already'
        });
    });
});
