// @ts-check

import path from 'node:path';
import { build, defineConfig, loadConfigFromFile, mergeConfig } from 'vite';

const dirname = import.meta.dirname;

const entries = [
    path.resolve(dirname, 'src/module/PetBag.ts'),
    path.resolve(dirname, 'src/module/TeamTechCenter.ts'),
    path.resolve(dirname, 'src/module/ItemWareHouse.ts'),
    path.resolve(dirname, 'src/commands/FightPuni.ts'),
    path.resolve(dirname, 'src/sign/sign.ts'),
    path.resolve(dirname, 'src/LocalPetSkin.ts'),
    path.resolve(dirname, 'src/CraftSkillStone.ts'),
    path.resolve(dirname, 'src/DisableSentry.ts')
];

const loadResult = await loadConfigFromFile({ command: 'build', mode: 'production' });

if (loadResult) {
    const { config } = loadResult;
    let cleanOutput = true;
    for (const entry of entries) {
        // https://github.com/rollup/rollup/issues/2756
        await build(
            mergeConfig(
                config,
                defineConfig({
                    build: {
                        lib: {
                            entry: [entry],
                            formats: ['es']
                        },
                        emptyOutDir: cleanOutput
                    }
                })
            )
        );
        cleanOutput = false;
    }
}
