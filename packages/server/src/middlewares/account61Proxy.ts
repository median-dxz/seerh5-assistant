import { createProxyMiddleware } from 'http-proxy-middleware';
import zlib from 'zlib';

export const account61Proxy = createProxyMiddleware({
    target: 'http://account-co.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    headers: {
        Origin: 'http://seerh5.61.com/',
        Referer: 'http://seerh5.61.com/'
    },
    pathRewrite: (path) => {
        const [pathname, query] = path.split('?');
        const params = new URLSearchParams(query);

        if (params.has('redirect_url')) {
            const redirectURL = params
                .get('redirect_url')!
                .replace(/http:\/\/localhost:[0-9]+\//, 'https://')
                .replace('v3/authorization', 'v3//authorization');

            params.set('redirect_url', redirectURL);
        }

        return `${pathname}?${params.toString()}`;
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map((cookie) =>
                    cookie.replace('path=/; domain=61.com;', 'path=/account-co.61.com;')
                );
            }

            if (proxyRes.statusCode === 302 && proxyRes.headers.location) {
                proxyRes.headers.location = proxyRes.headers.location.replace(
                    'http://account-co.61.com',
                    '/account-co.61.com'
                );
            }

            // console.log('Res Header:', proxyRes.headers);

            const headers = { ...proxyRes.headers };
            delete headers['content-length'];

            const chunks: Buffer[] = [];
            proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));

            proxyRes.on('end', () => {
                let rawBuf: Buffer = Buffer.concat(chunks);
                const url = req.url ?? '';

                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    rawBuf = zlib.gunzipSync(rawBuf);
                }

                if (['r=AccountManager', 'v3?r=login', 'history?duid='].some((part) => url.includes(part))) {
                    let body = rawBuf.toString();
                    body = body
                        .replaceAll(/: "\/v3/g, `: "/account-co.61.com/v3`)
                        .replaceAll(/"http:\/\/account-co.61.com/g, `"/account-co.61.com`);
                    rawBuf = Buffer.from(body);
                }
                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    rawBuf = zlib.gzipSync(rawBuf);
                }

                res.writeHead(proxyRes.statusCode ?? 200, headers);
                res.end(rawBuf);
            });
        }
    }
});
