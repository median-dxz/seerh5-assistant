import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saProxyAssets, saProxyLogin } from './sa.proxy.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();

    app.use((req, res, next) => {
        console.log(`[info]: sa-app: ${req.url}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    app.use('/worker', express.static(path.join(dirname, 'worker'), { cacheControl: false }));
    app.use('/strategy', express.static(path.join(dirname, 'strategy'), { cacheControl: false }));

    app.use(['/seerh5.61.com', '/resource'], saProxyAssets);

    app.get('/api/taomeeSDK', (req, res) => {
        delete req.headers.host;
        fetch(`https://opensdk.61.com/v1/js/taomeesdk.1.1.1.js`, {
            headers: req.headers,
            referrer: 'http://seerh5.61.com/',
            cache: 'no-cache',
            method: 'GET',
        })
            .then((r) => {
                res.writeHead(r.status, r.headers);
                return r.text();
            })
            .then((r) =>
                r
                    .replace('window.location.protocol+"//account-co.61.com/', `window.location.href+"api/login/`)
                    .replace(`t&&t[0]===i.a`, `((t && t[0] === i.a) || (i.a === 'localhost'))`)
                    .replace(
                        `this._app.formatUrl("?r=authorization/success")`,
                        `this._app.formatUrl("?r=authorization/success").replace(window.location.host+'/api/login','account-co.61.com')`
                    )
            )
            .then((r) => {
                res.end(r);
            });
    });

    app.use('/api/login', saProxyLogin);

    app.get('/api/data', (req, res) => {
        const data = readFileSync(path.resolve(dirname, 'data', 'data.json')).toString('utf8');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(data);
    });

    app.get('/api/14year', (req, res) => {
        const PHPSESSID = req.query['PHPSESSID'];
        const cookie_login_uid = req.query['cookie_login_uid'];
        fetch(`https://webevent.61.com/v2/?r=Seer14years/sign&callback=Callback`, {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                cookie: `PHPSESSID=${PHPSESSID}; cookie_login_uid=${cookie_login_uid}`,
                Referer: 'https://seer.61.com/',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
            method: 'GET',
        })
            .then((r) => r.text())
            .then((t) => {
                let Callback = (d) => {
                    res.status(200).json(d);
                    console.log(d);
                };
                eval(t);
            });
    });

    app.get('*', (req, res) => {
        res.status(200).send('这里什么也没有~');
    });

    const server = app.listen(2147);

    process.on('SIGINT', function () {
        console.log('Detected SIGINT (Ctrl-C), progress is shutting down...');
        server.close();
        process.exit();
    });
}

createServer();
