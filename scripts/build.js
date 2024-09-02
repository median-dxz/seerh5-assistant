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

const coreDir = path.join(cwd, 'packages', 'core');
const modTypeDir = path.join(cwd, 'packages', 'mod-type');
const modResolverDir = path.join(cwd, 'packages', 'mod-resolver');
const sdkDir = path.join(cwd, 'sdk');

const toPosixPath = (/** @type {string} */ p) => path.posix.format(path.parse(p));
let dir;
/** @type {string} */
let coreTarball;
/** @type {string} */
let modTypeTarball;
/** @type {string} */
let modResolverTarball;

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
    rimraf(toPosixPath(path.resolve(coreDir, 'dist'))).then(() => console.log('clean core/dist/*')),
    rimraf(toPosixPath(path.resolve(modTypeDir, 'dist'))).then(() => console.log('clean mod-type/dist/*')),
    rimraf(toPosixPath(path.resolve(modResolverDir, 'dist'))).then(() => console.log('clean mod-resolver/dist/*'))
])
    .then(() => exec('pnpm tsc:build', { cwd }).then(({ stdout }) => console.log(stdout)))
    .then(() => {
        const { commands, result } = concurrently(
            [
                {
                    command: 'pnpm pack --pack-destination ../../release',
                    cwd: coreDir,
                    name: 'core'
                },
                {
                    command: 'pnpm pack --pack-destination ../../release',
                    cwd: modTypeDir,
                    name: 'mod type'
                },
                {
                    command: 'pnpm pack --pack-destination ../../release',
                    cwd: modResolverDir,
                    name: 'mod resolver'
                }
            ],
            {
                prefix: '[{time} pack tarball: {name}]',
                prefixColors: 'auto'
            }
        );
        commands.forEach((cmd) => {
            cmd.stdout.subscribe((data) => {
                const tarball = data.toString().trim();
                switch (cmd.name) {
                    case 'core':
                        coreTarball = tarball;
                        break;
                    case 'mod type':
                        modTypeTarball = tarball;
                        break;
                    case 'mod resolver':
                        modResolverTarball = tarball;
                        break;
                    default:
                        break;
                }
            });
        });
        return result;
    })
    .then(
        () =>
            // 卸载旧版本
            concurrently([`npm uninstall @sea/core @sea/mod-type @sea/mod-resolver`], {
                cwd: sdkDir,
                prefix: '[{time} uninstall: {name}]',
                prefixColors: 'auto'
            }).result
    )
    .then(() =>
        installTarball([
            ['@sea/core', coreTarball],
            ['@sea/mod-type', modTypeTarball]
        ])
    )
    .then(() => installTarball([['@sea/mod-resolver', modResolverTarball]], true));

/**
 * @param {Array<[string, string]>} packages
 */
async function installTarball(packages, devDependencies = false) {
    const tarballs = await Promise.all(
        packages.map(async ([, tarball]) => {
            let targetFile = path.resolve(sdkDir, 'lib', path.basename(tarball));
            await fs.copyFile(tarball, targetFile);
            targetFile = path.resolve(sdkDir, targetFile);
            return targetFile;
        })
    );

    await concurrently([`npm install ${tarballs.join(' ')}${devDependencies ? ' -D' : ''}`], {
        cwd: sdkDir,
        prefix: '[{time} install: {name}]',
        prefixColors: 'auto'
    }).result;
}
