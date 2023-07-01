import path from 'path';
import { base } from './base.js';

import Router from '@koa/router';
import Koa from 'koa';

// koa middlewares
import c2k from 'koa-connect';
import logger from 'koa-logger';
import serve from 'koa-static';
// import { koaBody } from 'koa-body';

// sa middlewares
import { saAppJsProxy } from './middlewares/appJsProxy.js';
import { saAssetsProxy } from './middlewares/assetsProxy.js';
import { saLoginProxy } from './middlewares/loginProxy.js';

const app = new Koa();
const router = new Router();

async function createServer() {
    router.use(logger(), (ctx, next) => {
        ctx.set('access-control-allow-origin', '*');
        return next();
    });

    router.get('/seerh5.61.com/(.*)', async (ctx, next) => {
        ctx.path = '/' + ctx.params[0];
        return c2k(saAssetsProxy)(ctx, next);
    });

    router.all('/account-co.61.com/(.*)', async (ctx, next) => {
        ctx.path = '/' + ctx.params[0];
        return c2k(saLoginProxy)(ctx, next);
    });

    router.get('/api/js/:domain/(.*)', saAppJsProxy);

    router.get('/mods/(.*)', async (ctx, next) => {
        ctx.path = ctx.params[0];
        return serve(path.resolve(base, 'mods'), { index: false })(ctx, next);
    });

    app.use(router.routes()).use(router.allowedMethods());
    app.use(async (ctx, next) => {
        await next();
        if (!ctx.headerSent) {
            ctx.response.status = 404;
            ctx.response.body = {
                msg: '这里什么也没有~',
            };
        }
    });

    const server = app.listen(2147);

    process.on('SIGINT', function () {
        console.log('Detected SIGINT (Ctrl-C), progress is shutting down...');
        server.close();
        process.exit();
    });
}

createServer();
