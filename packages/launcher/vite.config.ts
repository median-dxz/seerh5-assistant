import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import Inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import externalURL from './build-plugins/vite-plugin-external-url';
import importMap from './build-plugins/vite-plugin-import-map';

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
            rollupOptions: {
                input: {
                    index: path.resolve(dirname, 'index.html'),
                },
                output: {
                    manualChunks: {
                        'mui-material': ['@mui/material'],
                    },
                },
            },
        },
        preview: {
            port: 1234,
        },
        plugins: [
            react(),
            importMap({
                options: {
                    'sea-core': { path: path.resolve(dirname, '../core/dist/index.js'), extras: ['sea-core/'] },
                },
            }),
            externalURL(['/api/js/seerh5.61.com/app.js']),
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
            Inspect(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(dirname, 'src'),
            },
        },
    };
});
