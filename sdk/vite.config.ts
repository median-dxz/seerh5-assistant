import type { ConfigEnv } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { SEAModInstall } from './build-plugins/vite-plugin-sea-mod-install';

export default defineConfig(({ command, mode }: ConfigEnv) => {
    const dirname = import.meta.dirname!;
    const env = loadEnv(mode, dirname, '');

    return {
        build: {
            sourcemap: 'inline',
            lib: {
                entry: [],
                fileName: (_, entry) => {
                    return entry + '.js';
                }
            },
            rollupOptions: {
                external: /@sea\/core/
            }
        },

        plugins: [
            SEAModInstall({
                server: env['VITE_SEA_SERVER_URL']
            })
        ]
    };
});
