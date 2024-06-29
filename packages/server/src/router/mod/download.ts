import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { modsRoot } from '../../paths.ts';

export const modDownloadRouter: FastifyPluginAsync<never> = async (server) => {
    await server.withTypeProvider<ZodTypeProvider>().register(fastifyMultipart, {
        attachFieldsToBody: 'keyValues',
        async onFile(part) {
            return pipeline(part.file, createWriteStream(path.join(server.config.APP_ROOT, modsRoot, part.filename)));
        }
    });
    server.post('/api/upload/mods', async (_req, res) => res.code(200).send());
};
