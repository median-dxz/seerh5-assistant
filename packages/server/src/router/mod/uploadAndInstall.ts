import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { z } from 'zod';
import { modsRoot } from '../../paths.ts';
import { ModManager } from './manager.ts';
import { ModIdentifierSchema, ModInstallOptionsSchema } from './schemas.ts';

export const modUploadAndInstallRouter: FastifyPluginAsync<never> = async (server) => {
    await server.register(fastifyMultipart, {
        attachFieldsToBody: 'keyValues',
        async onFile(part) {
            return pipeline(part.file, createWriteStream(path.join(server.config.APP_ROOT, modsRoot, part.filename)));
        }
    });
    server.withTypeProvider<ZodTypeProvider>().post(
        '/api/mods/install',
        {
            schema: {
                body: z.object({
                    mod: z.undefined(),
                    options: ModInstallOptionsSchema
                }),
                querystring: ModIdentifierSchema
            }
        },
        async (req, res) => {
            const { options } = req.body;
            const { id, scope } = req.query;
            await ModManager.install(id, scope, options);
            return res.code(200).send();
        }
    );
};
