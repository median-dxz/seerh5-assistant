// @ts-check

import concurrently from 'concurrently';
import cp from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { rimraf } from 'rimraf';

const exec = promisify(cp.exec);
const cwd = path.resolve(fileURLToPath(import.meta.url), '../..');

/** @type {{ [key: string]: { name: string, dir: string, tarball: string } }} */
const packages = {
    core: {
        name: '@sea/core',
        dir: path.resolve(cwd, 'packages', 'core'),
        tarball: ''
    },
    'mod-type': {
        name: '@sea/mod-type',
        dir: path.resolve(cwd, 'packages', 'mod-type'),
        tarball: ''
    },
    'mod-resolver': {
        name: '@sea/mod-resolver',
        dir: path.resolve(cwd, 'packages', 'mod-resolver'),
        tarball: ''
    }
};

const sdkDir = path.join(cwd, 'sdk');

const toPosixPath = (/** @type {string} */ p) => path.posix.format(path.parse(p));

await Promise.all([
    (async () => {
        if (!existsSync(path.resolve(cwd, 'release'))) {
            await fs.mkdir(path.resolve(cwd, 'release'));
        }
    })(),
    rimraf(toPosixPath(path.resolve(sdkDir, 'lib', '*.tgz')), { glob: true, preserveRoot: true }).then(() =>
        console.log('clean sdk/lib/*.tgz')
    ),
    rimraf(toPosixPath(path.resolve(cwd, 'release', '*.tgz')), { glob: true }).then(() =>
        console.log('clean release/*.tgz')
    ),
    rimraf(toPosixPath(path.resolve(cwd, '.tsbuildinfo', 'mod-resolver.tsbuildinfo'))).then(() =>
        console.log('clean .tsbuildinfo/mod-resolver.tsbuildinfo')
    ),
    rimraf(toPosixPath(path.resolve(cwd, '.tsbuildinfo', 'mod-type.tsbuildinfo'))).then(() =>
        console.log('clean .tsbuildinfo/mod-type.tsbuildinfo')
    ),
    rimraf(toPosixPath(path.resolve(cwd, '.tsbuildinfo', 'core.tsbuildinfo'))).then(() =>
        console.log('clean .tsbuildinfo/core.tsbuildinfo')
    ),
    rimraf(toPosixPath(path.resolve(packages.core.dir, 'dist'))).then(() => console.log('clean core/dist/*')),
    rimraf(toPosixPath(path.resolve(packages['mod-type'].dir, 'dist'))).then(() =>
        console.log('clean mod-type/dist/*')
    ),
    rimraf(toPosixPath(path.resolve(packages['mod-resolver'].dir, 'dist'))).then(() =>
        console.log('clean mod-resolver/dist/*')
    )
])
    .then(() => exec('pnpm tsc:build', { cwd }).then(({ stdout }) => console.log(stdout)))
    .then(() => {
        const { commands, result } = concurrently(
            Object.entries(packages).map(([name, { dir }]) => ({
                command: 'pnpm pack --pack-destination ../../release --json',
                cwd: dir,
                name: name
            })),
            {
                prefix: '[{time} pack tarball: {name}]',
                prefixColors: 'auto'
            }
        );
        commands.forEach((cmd) => {
            cmd.stdout.subscribe((data) => {
                /** @type { {name:string, filename:string} } */
                const tarball = JSON.parse(data.toString());
                packages[cmd.name].tarball = path.resolve(cwd, 'release', tarball.filename);
            });
        });
        return result;
    })
    .then(() => {
        const pkgList = Object.values(packages)
            .map((p) => p.name)
            .join(' ');
        // 卸载旧版本
        return concurrently([`npm uninstall ${pkgList}`], {
            cwd: sdkDir,
            prefix: `[{time} uninstall ${pkgList}]`,
            prefixColors: 'auto'
        }).result;
    })
    .then(() => installTarball([packages.core, packages['mod-type']]))
    .then(() => installTarball([packages['mod-resolver']], true));

/**
 * @param {Array<{name:string, tarball:string}>} packages
 */
async function installTarball(packages, devDependencies = false) {
    const tarballs = await Promise.all(
        packages.map(async ({ name, tarball }) => {
            let targetFile = path.resolve(sdkDir, 'lib', path.basename(tarball));
            await fs.copyFile(tarball, targetFile);
            targetFile = path.resolve(sdkDir, targetFile);
            return targetFile;
        })
    );

    await concurrently([`npm install ${tarballs.join(' ')}${devDependencies ? ' -D' : ''}`], {
        cwd: sdkDir,
        prefix: `[{time} install: ${packages.map((p) => p.name).join(' ')}]`,
        prefixColors: 'auto'
    }).result;
}
