import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import superjson from 'superjson';
import { z } from 'zod';
import { modsRoot } from '../../paths.ts';

import type { ModManager } from './manager.ts';
import { InstallModOptionsSchema } from './schemas.ts';

export const modUploadAndInstallRouter: FastifyPluginAsync<{ modManager: ModManager }> = async (
    server,
    { modManager }
) => {
    await server.register(fastifyMultipart, {
        attachFieldsToBody: 'keyValues',

        async onFile(part) {
            return pipeline(part.file, createWriteStream(path.join(server.config.APP_ROOT, modsRoot, part.filename)));
        },

        isPartAFile(fieldName, contentType, _fileName) {
            return contentType !== 'application/json';
        }
    });

    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);
    server.withTypeProvider<ZodTypeProvider>().post(
        '/api/mods/install',
        {
            schema: {
                body: z.object({
                    options: InstallModOptionsSchema.merge(z.object({ data: z.string().optional() }))
                }),
                querystring: z.object({ cid: z.string() })
            }
        },
        async (req, res) => {
            const { options } = req.body;
            const { cid } = req.query;
            const data = options.data == undefined ? undefined : superjson.parse<object>(options.data);

            const r = await modManager.install(cid, { ...options, data });
            return res.code(200).send(r);
        }
    );
};
