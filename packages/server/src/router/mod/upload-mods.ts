import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { modsRoot } from '../../paths.ts';

export const uploadModsRouter: FastifyPluginAsync<never> = async (server) => {
    await server.register(fastifyMultipart);
    server.post('/api/upload/mods', async (req, res) => {
        const { scope, id } = req.query as { id: string; scope: string };
        const parts = req.files();
        for await (const part of parts) {
            if (part.filename.endsWith('.js')) {
                await pipeline(
                    part.file,
                    createWriteStream(path.join(server.config.APP_ROOT, modsRoot, `${scope}.${id}.js`))
                );
            }
            if (part.filename.endsWith('.js.map')) {
                await pipeline(
                    part.file,
                    createWriteStream(path.join(server.config.APP_ROOT, modsRoot, `${scope}.${id}.js.map`))
                );
            }
        }

        return res.code(200).send({ success: true });
    });
};
