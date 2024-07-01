import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { z } from 'zod';
import { modsRoot } from '../../paths.ts';
import { ModManager } from './manager.ts';
import { ModIdentifierSchema, ModInstallOptionsSchema } from './schemas.ts';

export const modUploadAndInstallRouter: FastifyPluginAsync<never> = async (server) => {
    await server.register(fastifyMultipart, {
        attachFieldsToBody: 'keyValues',

        async onFile(part) {
            return pipeline(part.file, createWriteStream(path.join(server.config.APP_ROOT, modsRoot, part.filename)));
        },

        isPartAFile(fieldName, contentType, _fileName) {
            return contentType !== 'application/json';
        }
    });

    server.withTypeProvider<ZodTypeProvider>().post(
        '/api/mods/install',
        {
            schema: {
                body: z.object({
                    options: ModInstallOptionsSchema
                }),
                querystring: ModIdentifierSchema
            }
        },
        async (req, res) => {
            const { options } = req.body;
            const { id, scope } = req.query;
            const r = await ModManager.install(id, scope, options);
            return res.code(200).send(r);
        }
    );
};
