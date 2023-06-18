// vite.config.js
import { resolve } from 'path';
import externalGlobals from 'rollup-plugin-external-globals';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            // the proper extensions will be added
            fileName: 'my-lib',
        },
        rollupOptions: {
            external: ['sa-core'],
        },
    },
    plugins: [
        externalGlobals(
            (id) => {
                if (id.match(/sa-core/)) {
                    return 'sac';
                }
                return undefined as unknown as string;
            },
            { include: ['**/sdk-template/src/**'] }
        ),
    ],
});
