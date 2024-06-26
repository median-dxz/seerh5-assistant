// @ts-check

import cp from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(cp.exec);
const cwd = path.resolve(fileURLToPath(import.meta.url), '../..');

const coreDir = path.join(cwd, 'packages', 'core');
const modTypeDir = path.join(cwd, 'packages', 'mod-type');
const sdkDir = path.join(cwd, 'sdk');

let dir;
/** @type {string} */
let coreTarball;
/** @type {string} */
let modTypeTarball;

if (!existsSync(path.resolve(cwd, 'release'))) {
    await fs.mkdir(path.resolve(cwd, 'release'));
}

// 清空release文件夹
dir = await fs.readdir(path.resolve(cwd, 'release'));
for (const file of dir) {
    console.log(`deleted file: ${file}`);
    await fs.unlink(path.resolve(cwd, 'release', file));
}

// 清空lib文件夹
dir = await fs.readdir(path.resolve(sdkDir, 'lib'));
for (const file of dir) {
    if (file === '.gitkeep') continue;
    await fs.unlink(path.resolve(sdkDir, 'lib', file));
}

await exec('pnpm clean', { cwd: coreDir })
    .then(async () => {
        console.log(`core: clean dist dir`);
        const { stdout } = await exec('pnpm build', { cwd: coreDir });
        console.log(`core: build: ${stdout}`);
    })
    .then(async () => {
        const { stdout } = await exec('pnpm pack --pack-destination ../../release', { cwd: coreDir });
        console.log(`core: tarball output: ${stdout}`);
        coreTarball = stdout.trim();
        await installTarball('@sea/core', coreTarball);
    })
    .then(async () => {
        const { stdout } = await exec('pnpm pack --pack-destination ../../release', { cwd: modTypeDir });
        console.log(`mod type: tarball output: ${stdout}`);
        modTypeTarball = stdout.trim();
        installTarball('@sea/mod-type', modTypeTarball);
    });

/**
 * @param {string} packageName
 * @param {string} tarball
 */
async function installTarball(packageName, tarball) {
    // 卸载旧版本
    try {
        await exec(`npm uninstall ${packageName}`, { cwd: sdkDir });
    } catch (e) {
        console.error(e);
    }

    let targetFile = path.resolve(sdkDir, 'lib', path.basename(tarball));
    await fs.copyFile(tarball, targetFile);

    targetFile = path.relative(sdkDir, targetFile);
    const { stdout } = await exec(`npm install ${targetFile} -D`, { cwd: sdkDir });

    console.log(stdout);
}
