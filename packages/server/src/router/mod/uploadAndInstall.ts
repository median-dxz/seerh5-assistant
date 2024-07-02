import fastifyMultipart from '@fastify/multipart';
import type { DataObject } from '@sea/mod-type';
import type { FastifyPluginAsync } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import superjson from 'superjson';
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

    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);
    server.withTypeProvider<ZodTypeProvider>().post(
        '/api/mods/install',
        {
            schema: {
                body: z.object({
                    options: ModInstallOptionsSchema.merge(z.object({ data: z.string().optional() }))
                }),
                querystring: ModIdentifierSchema
            }
        },
        async (req, res) => {
            const { options } = req.body;
            const { id, scope } = req.query;
            const data = options.data == undefined ? undefined : superjson.parse<DataObject>(options.data);

            const r = await ModManager.install(scope, id, { ...options, data });
            return res.code(200).send(r);
        }
    );
};
