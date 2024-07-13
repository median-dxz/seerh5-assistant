import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import Inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import externalURL from './build-plugins/vite-plugin-external-url';
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
            rollupOptions: {
                input: {
                    index: path.resolve(dirname, 'index.html')
                },
                output: {
                    manualChunks: {
                        'mui-material': ['@mui/material']
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
            // 抑制vite在html中以相对路径引用外部脚本报错 ([vite #11854](https://github.com/vitejs/vite/pull/11854))
            // 这是一个特殊的用例, 在这边的情况是因为对入口脚本使用了后端代理, 该请求实际上由后端接管
            externalURL(['/api/js/seerh5.61.com/app.js']),
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
