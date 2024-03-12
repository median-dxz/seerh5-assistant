import cp from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(cp.exec);
const cwd = path.resolve(fileURLToPath(import.meta.url), '../..');

const serverDir = path.join(cwd, 'packages', 'server');
const launcherDir = path.join(cwd, 'packages', 'launcher');

// 构建launcher前端
try {
    await exec('pnpm build', { cwd: launcherDir });
} catch (e) {
    throw e;
}

// 构建server
try {
    await exec('pnpm build', { cwd: serverDir });
} catch (e) {
    throw e;
}

// 打包
try {
    await exec('pnpm executable', { cwd: serverDir });
} catch (e) {
    throw e;
}

// clean temp file
try {
    await fs.rm(path.join(serverDir, 'src', 'index.cjs'));
} catch (e) {
    throw e;
}