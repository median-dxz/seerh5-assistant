import { createProxyMiddleware } from 'http-proxy-middleware';
import zlib from 'zlib';

export const loginProxy = createProxyMiddleware({
    target: 'http://account-co.61.com/',
    changeOrigin: true,
    selfHandleResponse: true,
    headers: {
        Origin: 'http://seerh5.61.com/',
        Referer: 'http://seerh5.61.com/'
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            console.log(req.method, req.url);

            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(
                    (cookie) => cookie.replace('domain=61.com', '') + 'SameSite=None; Secure;'
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

                if (['r=AccountManager', 'v3?r=login'].some((part) => url.includes(part))) {
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
