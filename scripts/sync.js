import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = path.resolve(fileURLToPath(import.meta.url), '../..');

const coreDir = path.join(cwd, 'packages', 'core');
const launcherDir = path.join(cwd, 'packages', 'launcher');

// 同步版本字段

/**
 * @param {string} packageJsonFile
 * @param {string} jsFile
 */
async function syncVersion(packageJsonFile, jsFile) {
    try {
        const packageJson = (await fs.readFile(packageJsonFile)).toString('utf-8');
        const version = JSON.parse(packageJson).version;
        const fileContent = (await fs.readFile(jsFile)).toString('utf-8');
        await fs.writeFile(jsFile, fileContent.replace(/const\s*VERSION\s*=.*/, `const VERSION = '${version}';`));
    } catch (e) {
        console.error(e);
    }
}

syncVersion(path.join(coreDir, 'package.json'), path.join(coreDir, 'internal', 'core.ts'));
syncVersion(path.join(launcherDir, 'package.json'), path.join(launcherDir, 'src', 'constants.ts'));
