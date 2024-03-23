import { resolve } from 'path';
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
                resolve(__dirname, 'src/commands/FightPuni.ts'),
                resolve(__dirname, 'src/sign/sign.ts'),
                resolve(__dirname, 'src/LocalPetSkin.ts'),
                resolve(__dirname, 'src/CraftSkillStone.ts'),
                resolve(__dirname, 'src/DisableSentry.ts')
            ],
            formats: ['es'],
            fileName: (format, entry) => {
                return entry + '.js';
            }
        },
        rollupOptions: {
            external: /@sea\/core/
        }
    }
});
