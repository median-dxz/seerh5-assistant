import cp from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(cp.exec);
const cwd = path.resolve(fileURLToPath(import.meta.url), './../..');

const coreDir = path.join(cwd, 'packages', 'core');
const sdkDir = path.join(cwd, 'sdk');

let tarball;
try {
    var { stdout } = await exec('pnpm clean', { cwd: coreDir });
    console.log(`core: clean dist dir`);
    var { stdout } = await exec('pnpm build', { cwd: coreDir });
    console.log(`core: build: ${stdout}`);
    var { stdout } = await exec('pnpm pack --pack-destination ../../release', { cwd: coreDir });
    tarball = stdout.trim();
    console.log(`tarball output: ${tarball}`);
} catch (e) {
    throw e;
}

try {
    // 卸载旧版本
    try {
        await exec(`pnpm uninstall sea-core`, { cwd: sdkDir });
    } catch (e) {}

    const libDir = path.resolve(sdkDir, 'lib');
    const dir = await fs.readdir(libDir);
    for (const file of dir) {
        if (file.match(/sea-core/)) {
            console.log(`deleted file: ${file}`);
            await fs.unlink(path.resolve(libDir, file));
        }
    }

    let targetFile = path.resolve(libDir, path.basename(tarball));
    await fs.copyFile(tarball, targetFile);

    targetFile = path.relative(sdkDir, targetFile);
    const { stdout } = await exec(`pnpm add ${targetFile}`, { cwd: sdkDir });

    console.log(stdout);
} catch (e) {
    throw e;
}
