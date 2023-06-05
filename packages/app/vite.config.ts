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
                '/dev/': {
                    target: `http://localhost:${env['BACKEND_PORT']}`,
                    rewrite: (path) => path.replace(/^\/dev/, ''),
                },
                '/resource/sound': `http://localhost:${env['BACKEND_PORT']}/resource/sound`,
                '/api': `http://localhost:${env['BACKEND_PORT']}`,
            },
        },
        optimizeDeps: {
            include: ['sa-core'],
        },
        preview: {
            port: 1234,
        },
        plugins: [
            react(),
            VitePWA({
                manifest: false,
                injectManifest: undefined,
                devOptions: {
                    enabled: true,
                },
                workbox: {
                    navigationPreload: false,
                    importScripts: [`http://localhost:${env['BACKEND_PORT']}/worker/iframe-cookie.js`],
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
    };
});
