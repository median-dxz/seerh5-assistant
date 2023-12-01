import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import importMap from './vite-plugin/vite-plugin-import-map';
import Inspect from 'vite-plugin-inspect'

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            port: 1234,
            proxy: {
                '/api': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/seerh5.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/account-co.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/mods': `http://localhost:${env['VITE_BACKEND_PORT']}`,
            },
        },
        build: {
            target: 'esnext',
            dynamicImportVarsOptions: {
                exclude: ['src/service/ModManager/*'],
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        'sea-core': ['sea-core'],
                    },
                    minifyInternalExports: false,
                },
            },
        },
        preview: {
            port: 1234,
        },
        plugins: [
            react(),
            VitePWA({
                manifest: false,
                injectManifest: {
                    injectionPoint: undefined,
                },
                devOptions: {
                    enabled: true,
                },
                workbox: {
                    skipWaiting: true,
                    globIgnores: ['**/*'],
                    globPatterns: [],
                    navigateFallback: null,
                    runtimeCaching: [
                        {
                            urlPattern: /(seerh5\.61\.com\/resource\/assets)|(fonts\.gstatic\.com)/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'seerh5-game-cache',
                                expiration: {
                                    maxAgeSeconds: 60 * 60 * 24 * 7,
                                },
                            },
                        },
                    ],
                },
            }),
            importMap(),
            Inspect()
        ],
        resolve: {
            alias: {
                '@sea-launcher': path.resolve(dirname, 'src'),
            },
        },
    };
});
