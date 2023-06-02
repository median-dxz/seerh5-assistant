import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ProxyOptions } from 'vite';
import { gunzipSync } from 'zlib';

export const saApiConfig: ProxyOptions = {
    target: 'http://localhost:1234',
    configure(proxy, options) {
        proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const api = url.searchParams.get('req');
            switch (api) {
                case 'data':
                    res.write(readFileSync(path.join(__dirname, 'data', 'data.json')));
                    break;
                case '14year':
                    fetch(`https://webevent.61.com/v2/?r=Seer14years/sign&callback=Callback`, {
                        headers: {
                            accept: '*/*',
                            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                            cookie: `PHPSESSID=${url.searchParams.get(
                                'PHPSESSID'
                            )}; cookie_login_uid=${url.searchParams.get('cookie_login_uid')}`,
                            Referer: 'https://seer.61.com/',
                            'Referrer-Policy': 'strict-origin-when-cross-origin',
                        },
                        method: 'GET',
                    })
                        .then((r) => r.text())
                        .then((t) => {
                            let Callback = (d) => {
                                res.write(JSON.stringify(d));
                                console.log(d);
                            };
                            eval(t);
                        });
                    break;
                default:
                    res.write('unavailable');
                    break;
            }
            res.end();
        });
    },
};

export const saProxyConfig: ProxyOptions = {
    target: 'http://seerh5.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    rewrite: (path) => path.replace(/^\/seerh5.61.com/, ''),
    configure: (proxy, options) => {
        proxy.on('proxyRes', (proxyRes, req, res) => {
            let data: Buffer[] = [];
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
                    const entryFolder = path.resolve(__dirname, '../..', 'entry');
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
};
