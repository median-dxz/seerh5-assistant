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

let dir;
/** @type {string} */
let coreTarball;
/** @type {string} */
let modTypeTarball;
/** @type {string} */
let modResolverTarball;

await Promise.all([
    exec('pnpm clean', { cwd: coreDir }),
    (async () => {
        if (!existsSync(path.resolve(cwd, 'release'))) {
            await fs.mkdir(path.resolve(cwd, 'release'));
        }
    })(),
    rimraf(path.resolve(sdkDir, 'lib', '*.tgz'), { glob: true }),
    rimraf(path.resolve(cwd, 'release', '*.tgz'), { glob: true })
])
    .then(
        () =>
            concurrently(
                [
                    {
                        command: 'pnpm build',
                        cwd: coreDir,
                        name: 'core'
                    },
                    {
                        command: 'pnpm build',
                        cwd: modTypeDir,
                        name: 'mod type'
                    }
                ],
                {
                    prefix: '[{time} build: {name}]',
                    prefixColors: 'auto'
                }
            ).result
    )
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
    // packageName, tarball
    const pkgNames = packages.map(([name]) => name);

    // 卸载旧版本
    await concurrently([`npm uninstall ${pkgNames.join(' ')}`], {
        cwd: sdkDir,
        prefix: '[{time} uninstall: {name}]',
        prefixColors: 'auto'
    }).result;

    const tarballs = await Promise.all(
        packages.map(async ([, tarball]) => {
            let targetFile = path.resolve(sdkDir, 'lib', path.basename(tarball));
            await fs.copyFile(tarball, targetFile);
            targetFile = path.relative(sdkDir, targetFile);
            return targetFile;
        })
    );

    await concurrently([`npm install ${tarballs.join(' ')}${devDependencies ? ' -D' : ''}`], {
        cwd: sdkDir,
        prefix: '[{time} install: {name}]',
        prefixColors: 'auto'
    }).result;
}
