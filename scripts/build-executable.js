import concurrently from 'concurrently';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = path.resolve(fileURLToPath(import.meta.url), '../..');

const serverDir = path.join(cwd, 'packages', 'server');
const launcherDir = path.join(cwd, 'packages', 'launcher');

// 构建launcher前端
try {
    await concurrently(['pnpm build'], { cwd: launcherDir }).result;
} catch (e) {
    throw e;
}

// 构建server
try {
    await concurrently(['pnpm build'], { cwd: serverDir }).result;
} catch (e) {
    throw e;
}

// 打包
try {
    await concurrently(['pnpm executable'], { cwd: serverDir }).result;
} catch (e) {
    throw e;
}

// clean temp file
try {
    await fs.rm(path.join(serverDir, 'src', 'index.cjs'));
} catch (e) {
    throw e;
}
