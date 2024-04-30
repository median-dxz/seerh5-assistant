import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { writeFileSync } from 'fs';
import path from 'path';
import { modsRoot } from '../../paths.ts';

export const uploadModsRouter: FastifyPluginAsync<never> = async (server) => {
    if (!server.hasContentTypeParser('text/javascript')) {
        server.addContentTypeParser(
            'text/javascript',
            { parseAs: 'string' },
            async (req: FastifyRequest, body: string) => {
                return body;
            }
        );
    }
    server.post('/api/upload/mods', async (req, res) => {
        const file = req.body as string;
        const { scope, id } = req.query as { id: string; scope: string };
        writeFileSync(path.join(server.config.APP_ROOT, modsRoot, `${scope}.${id}.js`), file, { encoding: 'utf-8' });
        return res.code(200).send({ success: true });
    });
};
