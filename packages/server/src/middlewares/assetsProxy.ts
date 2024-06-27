import { readFileSync, writeFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import zlib from 'zlib';

export const createAssetsProxy = (appRoot: string) =>
    createProxyMiddleware({
        target: 'http://seerh5.61.com/',
        changeOrigin: true,
        selfHandleResponse: true,
        headers: {
            Origin: 'http://seerh5.61.com/',
            Referer: 'http://seerh5.61.com/'
        },
        on: {
            proxyRes: (proxyRes, req, res) => {
                const chunks: Buffer[] = [];
                proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));

                const headers = { ...proxyRes.headers };
                delete headers['content-length'];
                headers.date = new Date().toUTCString();

                proxyRes.on('end', () => {
                    res.statusCode = proxyRes.statusCode ?? 200;
                    for (const [k, v] of Object.entries(headers)) {
                        v && res.setHeader(k, v);
                    }

                    const rawBuf = Buffer.concat(chunks);
                    const url = req.url ?? '';
                    let respBuf = rawBuf;
                    if (url.includes('entry/entry.js')) {
                        const body = zlib.gunzipSync(rawBuf);
                        writeFileSync(path.resolve(appRoot, 'entry', 'official.js'), body.toString());
                        const data = readFileSync(path.resolve(appRoot, 'entry', 'injected.js'));
                        respBuf = zlib.gzipSync(data);

                        res.setHeader('cache-control', 'no-store, no-cache');
                    } else if (url.includes('sentry.js')) {
                        respBuf = zlib.gzipSync('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                    } else if (/resource\/app\/.*\/.*\.js/.exec(url)) {
                        // 反混淆
                        let script = zlib.gunzipSync(rawBuf).toString();
                        while (script.startsWith('eval')) {
                            script = eval(/eval([^)].*)/.exec(script)![1]) as string;
                        }
                        script = script.replaceAll(/console\.log/g, 'logFilter');
                        script = script.replaceAll(/console\.warn/g, 'warnFilter');
                        respBuf = zlib.gzipSync(`//@ sourceURL=http://seerh5.61.com/${url + '\n'}${script}`);
                    }
                    // console.log(`[Proxy]: --> ${req.url}`);
                    res.end(respBuf);
                });
            }
        }
    });
