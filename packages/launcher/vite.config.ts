import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import Inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import importMap from './build-plugins/vite-plugin-import-map';

const dirname = import.meta.dirname;

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            port: 1234,
            proxy: {
                '/api': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/seerh5.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/account-co.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/mods': `http://localhost:${env['VITE_BACKEND_PORT']}`
            }
        },
        build: {
            target: 'esnext',
            outDir: '../server/launcher',
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    index: path.resolve(dirname, 'index.html')
                },
                output: {
                    manualChunks: {
                        'vendor-mui-emotional': [
                            '@mui/material',
                            '@mui/icons-material',
                            '@mui/x-data-grid',
                            '@emotion/css',
                            '@emotion/react',
                            '@emotion/styled'
                        ],
                        'vendor-redux': ['@reduxjs/toolkit', 'react-redux']
                    }
                }
            }
        },
        preview: {
            port: 1234
        },
        plugins: [
            react({ jsxImportSource: '@emotion/react', devTarget: 'esnext' }),
            importMap({
                options: {
                    '@sea/core': path.resolve(dirname, '../core/dist/index.js')
                }
            }),
            VitePWA({
                manifest: false,
                injectManifest: {
                    injectionPoint: undefined
                },
                devOptions: {
                    enabled: true
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
                                    maxAgeSeconds: 60 * 60 * 24 * 7
                                }
                            }
                        }
                    ]
                }
            }),
            Inspect()
        ],
        resolve: {
            alias: {
                '@': path.resolve(dirname, 'src')
            }
        }
    };
});
