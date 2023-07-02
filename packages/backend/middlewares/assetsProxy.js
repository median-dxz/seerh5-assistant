import { readFileSync, writeFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import zlib from 'zlib';
import { base } from '../base.js';

export const saAssetsProxy = createProxyMiddleware({
    target: 'http://seerh5.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    headers: {
        Origin: 'http://seerh5.61.com/',
        Referer: 'http://seerh5.61.com/',
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            /** @type {Buffer[]} */
            const chunks = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));

            const headers = { ...proxyRes.headers };
            delete headers['content-length'];
            headers['date'] = new Date().toUTCString();

            proxyRes.on('end', async () => {
                const rawBuf = Buffer.concat(chunks);
                const url = req.url ?? '';
                let respBuf = rawBuf;
                if (url.includes('entry/entry.js')) {
                    const body = zlib.gunzipSync(rawBuf);
                    writeFileSync(path.resolve(base, 'entry', 'official.js'), body.toString());
                    const data = readFileSync(path.resolve(base, 'entry', 'assistant.js'));
                    respBuf = zlib.gzipSync(data);
                } else if (url.includes('sentry.js')) {
                    respBuf = zlib.gzipSync('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                }

                res.statusCode = proxyRes.statusCode ?? 200;
                for (const [k, v] of Object.entries(headers)) {
                    v && res.setHeader(k, v);
                }
                // console.log(`[Proxy]: --> ${req.url}`);
                res.end(respBuf);
            });
        },
    },
});
