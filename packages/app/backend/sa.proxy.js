import { readFileSync, writeFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import * as zlib from 'zlib';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const saProxyAssets = createProxyMiddleware({
    target: 'http://seerh5.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    headers: {
        Referer: 'http://seerh5.61.com/',
    },
    pathRewrite: function (path, req) {
        return path.replace('/seerh5.61.com', '/');
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            /** @type {Buffer[]} */
            const chunks = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));
            proxyRes.on('end', async () => {
                const rawBuf = Buffer.concat(chunks);
                if (req.url.includes('resource/app/entry/entry.js')) {
                    const body = zlib.gunzipSync(rawBuf);
                    writeFileSync(path.join(dirname, 'entry', 'official.js'), body.toString());
                    const data = readFileSync(path.join(dirname, 'entry', 'assistant.js'));
                    res.end(data);
                } else if (req.url.includes('sentry.js')) {
                    res.end('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                } else {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(rawBuf);
                }
            });
        },
    },
});

export const saProxyLogin = createProxyMiddleware({
    target: 'http://account-co.61.com/',
    changeOrigin: true,
    pathRewrite: function (path, req) {
        return path.replace('/api/login', '/');
    },
    selfHandleResponse: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log(req.method, req.url);
            const referer = proxyReq.getHeader('Referer');
            referer && proxyReq.setHeader('Referer', 'http://seerh5.61.com/');
            // console.log('Req Header:', proxyReq.getHeaders());
        },
        proxyRes: (proxyRes, req, res) => {
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map((cookie) => {
                    return cookie.replace('domain=61.com', '') + 'SameSite=None; Secure;';
                });
            }
            if (proxyRes.statusCode === 302) {
                proxyRes.headers['location'] = proxyRes.headers['location'].replace(
                    'http://account-co.61.com',
                    '/api/login'
                );
            }

            // console.log('Res Header:', proxyRes.headers);

            /** @type {Buffer[]} */
            const chunks = [];
            proxyRes.on('data', function (chunk) {
                chunks.push(chunk);
            });
            proxyRes.on('end', async () => {
                let rawBuf = Buffer.concat(chunks);
                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    rawBuf = zlib.gunzipSync(rawBuf);
                }

                if (['r=AccountManager', 'v3?r=login'].some((part) => req.url.includes(part))) {
                    let body = rawBuf.toString();
                    body = body
                        .replaceAll(/: "\/v3/g, `: "/api/login/v3`)
                        .replaceAll(/"http:\/\/account-co.61.com/g, `"/api/login`);
                    rawBuf = body;
                }
                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    rawBuf = zlib.gzipSync(rawBuf);
                }
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                res.end(rawBuf);
            });
        },
    },
});
