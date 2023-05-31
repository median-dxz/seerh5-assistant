import { readFileSync, writeFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { gunzipSync } from 'zlib';

import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const saProxyMiddleware = createProxyMiddleware({
    target: 'http://seerh5.61.com/',
    changeOrigin: true,
    pathFilter: ['/seerh5.61.com/**', '/resource/**'],
    selfHandleResponse: true,
    pathRewrite: { '^/seerh5.61.com': '' },
    on: {
        proxyRes: (proxyRes, req, res) => {
            let body = [];
            proxyRes.on('data', function (chunk) {
                body.push(chunk);
            });
            proxyRes.on('end', async () => {
                body = Buffer.concat(body);
                if (req.url.indexOf('resource/app/entry/entry.js') > 0) {
                    body = gunzipSync(body);
                    const entryFolder = path.resolve(__dirname, '../../..', 'entry');
                    writeFileSync(path.join(entryFolder, 'official.js'), body.toString());
                    let data = readFileSync(path.join(entryFolder, 'assistant.js'));
                    res.end(data);
                    return;
                } else if (req.url.indexOf('sentry.js') > 0) {
                    res.end('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                } else {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(body);
                }
            });
        },
    },
});

export { __dirname };

