// @ts-check

import { createRequire } from 'module';
import path from 'node:path';
import { build } from 'vite';

const require = createRequire(import.meta.url);

/**
 * @type {typeof import('./mods/common/constants.json')}
 */
const { scope } = require('./mods/common/constants.json');
const dirname = import.meta.dirname;

const entries = [
    'module/PetBag.ts',
    'module/TeamTechCenter.ts',
    'module/ItemWareHouse.ts',
    'quick-access/FightPuni.ts',
    'enhancement/index.ts',
    'realm/index.ts',
    'sign/index.ts',
    'CraftSkillStone.ts',
    'LocalPetSkin.ts',
    'battle.ts',
    'command.ts',
    'strategy.ts'
];

let cleanOutput = true;
for (const entry of entries) {
    // https://github.com/rollup/rollup/issues/2756
    // 另外注意在没有设置configFile的时候, 默认会从vite.config.ts中读取配置并合并
    await build({
        build: {
            lib: {
                entry: [path.resolve(dirname, 'mods', scope, entry)],
                formats: ['es']
            },
            emptyOutDir: cleanOutput
        }
    });
    cleanOutput = false;
}
