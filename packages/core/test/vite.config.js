//@ts-check
import { defineConfig } from 'vite';

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import url from 'url';
import { gunzipSync } from 'zlib';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
    root: __dirname,
    server: {
        open: true,
        port: 1234,
        proxy: {
            '/seerh5.61.com': {
                target: 'http://seerh5.61.com/',
                changeOrigin: true,
                selfHandleResponse: true,
                rewrite: (path) => path.replace(/^\/seerh5.61.com/, ''),
                configure: (proxy, options) => {
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        /** @type {Buffer[]} */
                        let data = [];
                        proxyRes.on('data', function (chunk) {
                            data.push(chunk);
                        });
                        proxyRes.on('end', async () => {
                            let body = Buffer.concat(data);
                            if (!req.url) {
                                res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
                                res.end(body);
                                return;
                            }
                            if (req.url.indexOf('resource/app/entry/entry.js') > 0) {
                                body = gunzipSync(body);
                                const entryFolder = path.resolve(__dirname, '../../..', 'entry');
                                writeFileSync(path.join(entryFolder, 'official.js'), body.toString());
                                const newEntry = readFileSync(path.join(entryFolder, 'assistant.js'));
                                res.end(newEntry);
                            } else if (req.url.indexOf('sentry.js') > 0) {
                                res.end('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                            } else {
                                res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
                                res.end(body);
                            }
                        });
                    });
                },
            },
        },
    },
});
