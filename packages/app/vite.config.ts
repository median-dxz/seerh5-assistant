import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { saApiConfig, saProxyConfig } from './sa.proxy.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    server: {
        port: 1234,
        proxy: {
            '/api': saApiConfig,
            '/seerh5.61.com': saProxyConfig,
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            injectManifest: {
                injectionPoint: null,
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
            workbox: {
                globIgnores: ['**/*'],
                navigationPreload: false,
                runtimeCaching: [
                    {
                        urlPattern: /seerh5\.61\.com\/resource\/assets/,
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
});
