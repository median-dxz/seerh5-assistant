import path from 'node:path';
import type { ConfigEnv } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { SEAModInstall } from './build-plugins/vite-plugin-sea-mod-install';

export default defineConfig(({ command, mode }: ConfigEnv) => {
    const dirname = import.meta.dirname!;
    const env = loadEnv(mode, dirname, '');

    return {
        build: {
            sourcemap: 'inline' as const,
            rollupOptions: {
                external: /@sea\/core/,
                output: {
                    entryFileNames: '[name]-[hash].js'
                    // sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => relativeSourcePath
                }
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(dirname, 'mods')
            }
        },
        plugins: [
            SEAModInstall({
                server: env['VITE_SEA_SERVER_URL']
            })
        ]
    };
});
