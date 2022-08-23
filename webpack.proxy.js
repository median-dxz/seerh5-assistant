import { createProxyMiddleware } from 'http-proxy-middleware';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { __dirname } from './webpack.config.js';
import { gunzipSync } from 'zlib';

let saProxyMiddleware = createProxyMiddleware({
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
                    writeFileSync(path.join(__dirname, 'loader', 'offical-loader.js'), body.toString());
                    let data = readFileSync(path.join(__dirname, 'loader', 'as-loader.js'));
                    res.end(data);
                    return;
                } else if (req.url.indexOf('sentry.js') > 0) {
                    res.end('var Sentry = {init: ()=>{}}');
                } else {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(body);
                }
            });
        },
    },
});

export { saProxyMiddleware };
