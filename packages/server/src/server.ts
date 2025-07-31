import fs from 'node:fs';
import path from 'node:path';

import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyMiddie from '@fastify/middie';
import fastifyStatic from '@fastify/static';
import ws from '@fastify/websocket';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';

import { envOptions } from './config.ts';

// middlewares for seerh5 client
import { account61Proxy } from './middlewares/account61Proxy.ts';
import { createAssetsProxy } from './middlewares/assetsProxy.ts';
import { taomeeProxy } from './middlewares/taomeeProxy.ts';

import { buildSEALContext } from './context.ts';
import { fastifyLogRotate } from './logger/index.ts';
import { apiRouter } from './router/index.ts';

import { configsRoot, launcherRoot, logsRoot, modsRoot, staticAssetsRoot } from './paths.ts';
import { modUploadAndInstallRouter } from './router/mod/uploadAndInstall.ts';
import { setupConfigHandlers, setupModManager } from './setup/index.ts';

export async function createServer() {
    const server = fastify({
        logger: {
            transport: {
                target: '@fastify/one-line-logger'
            }
        }
    });
    await server.register(fastifyEnv, envOptions);

    const root = server.config.APP_ROOT;
    const folders = [configsRoot, launcherRoot, logsRoot, modsRoot, staticAssetsRoot, configsRoot + '/' + modsRoot];
    folders.forEach((folder) => {
        if (!fs.existsSync(path.resolve(root, folder))) {
            fs.mkdirSync(path.resolve(root, folder));
        }
    });

    await server.register(fastifyLogRotate);
    await server.register(fastifyMiddie);
    await server.register(cors, {
        origin: (origin, cb) => {
            if (!origin) {
                cb(null, true);
                return;
            }
            const hostname = new URL(origin).hostname;
            if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname === '127.0.0.1') {
                cb(null, true);
                return;
            }
            // Generate an error on other origins, disabling access
            cb(new Error('Not allowed'), false);
        }
    });

    void server.use('/seerh5.61.com/', createAssetsProxy(server));
    void server.use('/account-co.61.com/', account61Proxy);
    void server.register(taomeeProxy);

    const configHandlers = await setupConfigHandlers(server.config.APP_ROOT);
    const mod = await setupModManager(server.config.APP_ROOT, configHandlers.modIndex);

    void server.register(fastifyStatic, {
        root: path.resolve(server.config.APP_ROOT, modsRoot),
        prefix: `/${modsRoot}`,
        extensions: ['js', 'json'],
        index: false,
        list: true
    });

    void server.register(fastifyStatic, {
        root: path.resolve(server.config.APP_ROOT, launcherRoot),
        prefix: '/',
        index: 'index.html',
        decorateReply: false
    });

    void server.register(fastifyStatic, {
        root: path.resolve(server.config.APP_ROOT, staticAssetsRoot),
        prefix: `/${staticAssetsRoot}`,
        index: false,
        decorateReply: false
    });

    void server.register(ws);
    void server.register(fastifyTRPCPlugin, {
        prefix: '/api',
        useWSS: true,
        trpcOptions: {
            router: apiRouter,
            createContext: buildSEALContext({
                launcherConfig: configHandlers.launcherConfig,
                modManager: mod.manager,
                modFileHandler: mod.fileHandler,
                petCatchTime: configHandlers.petCatchTime,
                taskOptions: configHandlers.taskConfig
            })
        }
    });

    void server.register(modUploadAndInstallRouter, { modManager: mod.manager, modFileHandler: mod.fileHandler });

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
