import fs from 'node:fs';
import path from 'node:path';

import type { ModIndex } from '../configHandlers/ModIndex.ts';
import { configsRoot, modsRoot } from '../paths.ts';
import { FileSystemStorage } from '../shared/FileSystemStorage.ts';
import { ModManager } from '../shared/ModManager.ts';
import { praseCompositeId, type IModFileHandler } from '../shared/utils.ts';

export async function setupModManager(appRoot: string, modIndex: ModIndex) {
    const modConfigStorageBuilder = (cid: string) => {
        const { id, scope } = praseCompositeId(cid);
        return new FileSystemStorage(path.join(appRoot, configsRoot, modsRoot, `${scope}.${id}.json`));
    };
    const modDataStorageBuilder = (cid: string) => {
        const { id, scope } = praseCompositeId(cid);
        return new FileSystemStorage(path.join(appRoot, modsRoot, `${scope}.${id}.data.json`));
    };

    const modManager = new ModManager(modIndex, modConfigStorageBuilder, modDataStorageBuilder);
    await modManager.init();

    const modFileHandler: IModFileHandler = {
        root: appRoot,
        buildPath(filename: string) {
            return path.join(this.root, modsRoot, filename);
        },
        remove(cid) {
            const { id, scope } = praseCompositeId(cid);
            fs.rmSync(path.join(this.root, modsRoot, `${scope}.${id}.js`));
        }
    };

    return { manager: modManager, fileHandler: modFileHandler };
}
