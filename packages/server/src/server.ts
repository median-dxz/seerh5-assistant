import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyMiddie from '@fastify/middie';
import fastify from 'fastify';

import { envOptions } from './config.ts';

// middlewares for seerh5 client
import { createAppJsProxy } from './middlewares/appJsProxy.ts';
import { createAssetsProxy } from './middlewares/assetsProxy.ts';
import { loginProxy } from './middlewares/loginProxy.ts';

// const prefix = '/sea-server';

export async function createServer() {
    const server = fastify({
        logger: {
            level: 'trace',
            transport: {
                target: '@fastify/one-line-logger',
            },
        },
    });

    await server.register(fastifyEnv, envOptions);
    await server.register(fastifyMiddie);
    await server.register(cors, {
        origin: (origin, cb) => {
            if (!origin) {
                cb(new Error('Empty origin'), false);
                return;
            }
            const hostname = new URL(origin).hostname;
            if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname === '127.0.0.1') {
                cb(null, true);
                return;
            }
            // Generate an error on other origins, disabling access
            cb(new Error('Not allowed'), false);
        },
    });

    void server.use('/seerh5.61.com/', createAssetsProxy(server.config.APP_ROOT));
    void server.use('/account-co.61.com/', loginProxy);
    void server.register(createAppJsProxy);

    //     void server.register(ws);
    //     void server.register(fastifyTRPCPlugin, {
    //         prefix: "/api",
    //         useWSS: true,
    //         trpcOptions: { router: appRouter, createContext },
    //     });

    const stop = async () => {
        await server.close();
    };

    const start = async () => {
        const port = server.config.PORT;
        try {
            await server.listen({ port });
        } catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    };

    return { server, start, stop };
}

// import ws from '@fastify/websocket';
// import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

// import { appRouter } from './router/index.ts';
// import { createContext } from './context.ts';

// import apiRouter from './routers/index.ts';

// router.get('/api/mods', apiRouter.mod.getAllMods);
// router.get('/api/mods/:namespace/config', apiRouter.mod.getConfig);
// router.get('/api/pet', apiRouter.config.queryPets);
// router.get('/api/petFragmentLevel', apiRouter.config.petFragmentLevel);
// router.get('/api/realm', apiRouter.config.realm);
// router.get('/api/launcher/config', apiRouter.config.launcherConfig);

// router.post('/api/launcher/config', koaBody(), apiRouter.config.launcherConfig);
// router.post('/api/mods/:namespace/config', koaBody(), apiRouter.mod.setConfig);
// router.post('/api/pet', koaBody(), apiRouter.config.cachePets);

// router.get('/mods/(.*)', async (ctx, next) => {
//     ctx.path = ctx.params[0];
//     return serve(path.resolve(configBase, 'mods'), { index: false })(ctx, next);
// });
// app.use(router.routes()).use(router.allowedMethods());
