import * as path from 'path';
import { fileURLToPath } from 'url';
import { HtmlTagDescriptor, PluginOption, defineConfig, loadEnv } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, path.resolve(dirname, 'env'), '');

    const loadAppJs: PluginOption = {
        name: 'load-app-js',
        transformIndexHtml: {
            handler(html) {
                const tags: HtmlTagDescriptor[] = [
                    {
                        tag: 'script',
                        injectTo: 'body',
                        attrs: {
                            src: '/api/js/seerh5.61.com/app.js',
                            defer: true,
                        },
                    },
                ];
                return { html, tags };
            },
        },
    };

    return {
        root: __dirname,
        server: {
            port: 1234,
            proxy: {
                '/api': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/seerh5.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
                '/account-co.61.com': `http://localhost:${env['VITE_BACKEND_PORT']}`,
            },
        },
        // plugins: [loadAppJs],
    };
});
