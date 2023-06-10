import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            port: 1234,
            proxy: {
                '/resource': `http://localhost:${env['VITE_BACKEND_PORT']}/resource`,
                '/seerh5.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}/seerh5.61.com`,
                '/api': `http://localhost:${env['VITE_BACKEND_PORT']}`,
            },
            watch: {
                ignored: ['!**/node_modules/sa-core/**'],
            },
        },
        optimizeDeps: {
            exclude: ['sa-core'],
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
                    navigationPreload: true,
                    importScripts: [`http://localhost:${env['VITE_BACKEND_PORT']}/worker/iframe-cookie.js`],
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
        ],
        resolve: {
            alias: {
                '@sa-app': path.resolve(dirname, 'src'),
                '@mui/styled-engine': path.resolve('../../node_modules', '@mui/styled-engine-sc'),
            },
        },
    };
});
