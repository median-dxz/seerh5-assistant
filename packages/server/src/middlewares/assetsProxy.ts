import { readFileSync, writeFileSync } from 'fs';
import type { ServerResponse } from 'http';
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

                const copyHeaders = (
                    res: ServerResponse,
                    headers: Iterable<[string, string | string[] | undefined]>
                ) => {
                    for (const [k, v] of headers) {
                        if (k === 'content-length') {
                            continue;
                        } else if (k === 'date') {
                            res.setHeader(k, new Date().toUTCString());
                        } else {
                            v && res.setHeader(k, v);
                        }
                    }
                };

                copyHeaders(res, Object.entries(proxyRes.headers));

                proxyRes.on('end', () => {
                    res.statusCode = proxyRes.statusCode ?? 200;

                    // 404 fallback
                    if (res.statusCode === 404) {
                        let fallbackUrl = '';
                        if (req.url?.includes('resource/assets/pet/head')) {
                            fallbackUrl = 'http://seerh5.61.com/resource/assets/pet/head/164.png';
                        } else if (req.url?.includes('resource/cjs_animate/pet')) {
                            fallbackUrl = 'http://seerh5.61.com/resource/cjs_animate/pet/164.js';
                        } else if (req.url?.includes('resource/assets/fightResource/pet')) {
                            fallbackUrl = 'http://seerh5.61.com/resource/assets/fightResource/pet/164.png';
                        }

                        if (fallbackUrl) {
                            res.statusCode = 200;
                            const headers = { ...req.headers } as Record<string, string>;

                            delete headers['content-encoding'];
                            headers['host'] = 'seerh5.61.com';
                            headers['origin'] = 'http://seerh5.61.com';

                            void fetch(fallbackUrl, {
                                headers,
                                referrer: 'http://seerh5.61.com/'
                            }).then((r) => {
                                if (!r.ok) {
                                    console.error('[Proxy]:', fallbackUrl, r.statusText);
                                    res.statusCode = 500;
                                    res.end('[SEA Backend]: Assets Proxying Failed: Internal Error');
                                    return;
                                }
                                copyHeaders(res, r.headers.entries());
                                res.removeHeader('content-encoding');
                                return r.arrayBuffer().then((buf) => {
                                    res.end(Buffer.from(buf));
                                });
                            });
                            return;
                        }
                    }

                    const rawBuf: Buffer = Buffer.concat(chunks);
                    const url = req.url ?? '';
                    let resBuf = rawBuf;

                    // 反混淆
                    const extractEval = (script: string) => {
                        const matcher = /^eval([^)].*)/;
                        for (let mr = matcher.exec(script); mr; mr = matcher.exec(script)) {
                            script = eval(mr[1]) as string;
                        }
                        return script;
                    };

                    if (url.includes('sentry.js')) {
                        resBuf = zlib.gzipSync('var Sentry = {init: ()=>{}, configureScope: ()=>{}}');
                    }

                    if (url.includes('app.js')) {
                        let script = zlib.gunzipSync(rawBuf).toString();
                        script = extractEval(script)
                            .replace(`= window["wwwroot"] || "";`, `= '/seerh5.61.com/';`) // 替换wwwroot
                            .replace(/loadSingleScript\("https:\/\/hm\.baidu\.com\/hm\.js\?[a-z0-9].*"\);/, '') // 删除百度统计
                            .replace(
                                `web_sdk_js_url`,
                                `web_sdk_js_url.replace('https://opensdk.61.com/', 'api/taomee/opensdk.61.com/')`
                            ); // 代理sdk
                        resBuf = zlib.gzipSync(script);
                    }

                    if (url.includes('entry/entry.js')) {
                        const body = zlib.gunzipSync(rawBuf);
                        writeFileSync(path.resolve(appRoot, 'entry', 'official.js'), body.toString());
                        const data = readFileSync(path.resolve(appRoot, 'entry', 'injected.js'));
                        resBuf = zlib.gzipSync(data);

                        res.setHeader('cache-control', 'no-store, no-cache');
                    } else if (/resource\/app\/.*\/.*\.js/.exec(url)) {
                        let script = zlib.gunzipSync(rawBuf).toString();
                        script = extractEval(script)
                            .replaceAll(/console\.log/g, 'logFilter')
                            .replaceAll(/console\.warn/g, 'warnFilter');
                        script = `//# sourceURL=http://seerh5.61.com${url + '\n'}${script}`;
                        resBuf = zlib.gzipSync(script);
                    }
                    // console.log(`[Proxy]: --> ${req.url}`);
                    res.end(resBuf);
                });
            }
        }
    });
