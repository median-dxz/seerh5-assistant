import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import superjson from 'superjson';
import { z } from 'zod';

import type { ModManager } from '../../shared/ModManager.ts';
import type { IModFileHandler } from '../../shared/utils.ts';
import { InstallModOptionsSchema } from './schemas.ts';

export const modUploadAndInstallRouter: FastifyPluginAsync<{
    modManager: ModManager;
    modFileHandler: IModFileHandler;
}> = async (server, { modManager, modFileHandler }) => {
    await server.register(fastifyMultipart, {
        attachFieldsToBody: 'keyValues',

        async onFile(part) {
            return pipeline(part.file, createWriteStream(modFileHandler.buildPath(part.filename)));
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
            return res.code(200).send({ result: r });
        }
    );
};
