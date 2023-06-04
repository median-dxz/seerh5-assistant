import { readFileSync, writeFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const saProxy = createProxyMiddleware({
    target: 'http://seerh5.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    pathRewrite: function (path, req) {
        return path.replace('/seerh5.61.com', '/');
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            /** @type {Buffer[]} */
            const chunks = [];
            proxyRes.on('data', function (chunk) {
                chunks.push(chunk);
            });
            proxyRes.on('end', async () => {
                const rawBuf = Buffer.concat(chunks);
                if (req.url.indexOf('resource/app/entry/entry.js') > 0) {
                    const body = gunzipSync(rawBuf);
                    writeFileSync(path.join(dirname, 'entry', 'official.js'), body.toString());
                    const data = readFileSync(path.join(dirname, 'entry', 'assistant.js'));
                    res.end(data);
                } else if (req.url.indexOf('sentry.js') > 0) {
                    res.end('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                } else {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(rawBuf);
                }
            });
        },
    },
});
