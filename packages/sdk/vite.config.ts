// vite.config.js
import { resolve } from 'path';
import externalGlobals from 'rollup-plugin-external-globals';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: [
                resolve(__dirname, 'src/module/PetBag.ts'),
                resolve(__dirname, 'src/module/TeamTechCenter.ts'),
                resolve(__dirname, 'src/module/ItemWareHouse.ts'),
                resolve(__dirname, 'src/quick-access-plugin/FightPuni.ts'),
                resolve(__dirname, 'src/quick-access-plugin/ToggleAutoCure.ts'),
                resolve(__dirname, 'src/sign/sign.ts'),
                resolve(__dirname, 'src/LocalPetSkin.ts'),
            ],
            formats: ['es'],
            fileName: (format, entry) => {
                return entry + '.js';
            },
        },
        rollupOptions: {
            external: ['sea-core'],
        },
    },
    plugins: [
        externalGlobals(
            (id) => {
                if (id.match(/sea-core/)) {
                    return 'sac';
                }
                return undefined as unknown as string;
            },
            { include: ['src/**/*'] }
        ),
    ],
});
