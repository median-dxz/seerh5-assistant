import { beforeEach, describe, expect, test, vi } from 'vitest';
import { modIndexes } from '../../src/data/ModIndexes';

import superjson from 'superjson';
import type { ModState } from '../../src/data/ModIndexes';
import type { ModInstallOptions } from '../../src/router/mod/manager';
import { ModManager } from '../../src/router/mod/manager';
import { getNamespace } from '../../src/utils';

const modState1: ModState = {
    enable: true,
    requireConfig: false,
    requireData: false,
    builtin: true,
    preload: false
};

const modState2: ModState = {
    enable: true,
    requireConfig: true,
    requireData: true,
    builtin: false,
    preload: false
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
                                [getNamespace('scope1', 'mod1'), modState1],
                                [getNamespace('scope2', 'mod2'), modState2]
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
    const ns = getNamespace(scope, id);

    test('load config and data', () => {
        expect(ModManager.modData.size).toBe(1);
        expect(ModManager.modConfig.size).toBe(1);

        const ns = getNamespace('scope2', 'mod2');
        const data = ModManager.modData.get(ns);
        const config = ModManager.modConfig.get(ns);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('install a new mod with config and data', async () => {
        const installOptions: ModInstallOptions = {
            config: { key: 'value' },
            data: { key: 'value' },
            update: false
        };

        const result = await ModManager.install(scope, id, installOptions);
        expect(result).toEqual({ success: true });
        expect(modIndexes.set).toHaveBeenLastCalledWith(scope, id, {
            builtin: false,
            preload: false,
            enable: true,
            requireConfig: true,
            requireData: true
        });

        const data = ModManager.modData.get(ns);
        const config = ModManager.modConfig.get(ns);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('update a mod, should not change the data and config', async () => {
        const installOptions1: ModInstallOptions = {
            config: { key: 'value' },
            data: { key: 'value' },
            update: false
        };

        const installOptions2: ModInstallOptions = {
            config: { key: 'new value' },
            data: { key: 'new value' },
            update: true
        };

        await ModManager.install(scope, id, installOptions1);
        const result = await ModManager.install(scope, id, installOptions2);
        expect(result).toEqual({ success: true });

        const data = ModManager.modData.get(ns);
        const config = ModManager.modConfig.get(ns);

        expect(data?.query()).toEqual({ key: 'value' });
        expect(config?.query()).toEqual({ key: 'value' });
    });

    test('install a mod that already exist', async () => {
        const installOptions1: ModInstallOptions = {
            config: { key: 'value' },
            data: { key: 'value' },
            update: false
        };

        const installOptions2: ModInstallOptions = {
            config: { key: 'new value' },
            data: { key: 'new value' },
            update: false
        };

        await ModManager.install(scope, id, installOptions1);
        const result = await ModManager.install(scope, id, installOptions2);
        expect(result).toEqual({
            success: false,
            reason: 'there has existed a mod with the same id and scope already'
        });
    });
});
