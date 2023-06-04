import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saProxy } from './sa.proxy.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const app = express();

    app.use((req, res, next) => {
        console.log(`[info]: sa-app: ${req.url}`);
        next();
    });

    app.use(['/seerh5.61.com', '/resource/sound'], saProxy);

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

    app.listen(2147);
}

createServer();
