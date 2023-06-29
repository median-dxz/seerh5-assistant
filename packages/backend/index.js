import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';

import { saDataProvider } from './sa.dataProvider.js';
import { saModsProvider } from './sa.modsProvider.js';
import { saProxyAssets, saProxyLogin } from './sa.proxy.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();

    app.use(bodyParser.json());

    app.use((req, res, next) => {
        console.log(`[info]: sa-app: ${req.url}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    app.use(['/seerh5.61.com'], saProxyAssets);

    app.get('/api/js/seerh5.61.com/app.js', (req, res) => {
        fetch(`https://seerh5.61.com/app.js?t=${Date.now()}`)
            .then((r) => {
                res.status(r.status);
                for (const [header, value] of r.headers.entries()) {
                    if (!['cache-control', 'content-encoding'].includes(header)) {
                        res.header(header, value);
                    }
                }
                res.header('cache-control', 'no-store, no-cache');
                return r.text();
            })
            .then((appJs) => {
                while (appJs.startsWith('eval')) {
                    appJs = eval(appJs.match(/eval([^)].*)/)[1]);
                }
                appJs = `//@ sourceURL=http://seerh5.61.com/app.js\n${appJs}`;
                appJs = appJs
                    .replace(`= window["wwwroot"] || "";`, `= '/seerh5.61.com/';`)
                    .replace(/loadSingleScript\("https:\/\/hm\.baidu\.com\/hm\.js\?[a-z0-9].*"\);/, '')
                    .replace(`web_sdk_js_url`, `'/api/js/opensdk.61.com/taomeesdk.js'`);
                return appJs;
            })
            .then((r) => res.end(r));
    });

    app.get('/api/js/opensdk.61.com/taomeesdk.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
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
                (`//@ sourceURL=https://opensdk.61.com/v1/js/taomeesdk.1.1.1.js\n` + r)
                    .replace('window.location.protocol+"//account-co.61.com/', `window.location.href+"api/login/`)
                    .replace(`t&&t[0]===i.a`, `((t && t[0] === i.a) || (i.a === 'localhost'))`)
                    .replace(
                        `this._app.formatUrl("?r=authorization/success")`,
                        `this._app.formatUrl("?r=authorization/success").replace(window.location.host+'/api/login','account-co.61.com')`
                    )
                    .replace(`//support-res.61.com/gather/gather.js`, `api/js/support-res.61.com/gather.js`)
            )
            .then((r) => {
                res.end(r);
            });
    });

    app.get('/api/js/support-res.61.com/gather.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        delete req.headers.host;
        fetch(`https://support-res.61.com/gather/gather.js`, {
            headers: req.headers,
            referrer: 'http://seerh5.61.com/',
            cache: 'no-cache',
            method: 'GET',
        })
            .then((r) => {
                res.writeHead(r.status, r.headers);
                return r.text();
            })
            .then((r) => {
                return (`//@ sourceURL=https://support-res.61.com/gather/gather.js\n` + r)
                    .replaceAll(/document.referrer/g, `'http://seerh5.61.com/'`)
                    .replaceAll(/document.location.href/g, `'http://seerh5.61.com/'`);
            })
            .then((r) => {
                res.end(r);
            });
    });

    app.use('/api/login', saProxyLogin);

    app.use('/api/data', saDataProvider);
    app.use('/api/mods', saModsProvider);
    app.use('/api/mods', express.static(path.join(dirname, 'mods'), { cacheControl: false }));

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
