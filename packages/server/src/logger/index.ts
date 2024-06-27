import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import * as rfs from 'rotating-file-stream';

interface fastifyLogRotateOptions extends FastifyPluginOptions {}

export async function fastifyLogRotate(fastify: FastifyInstance, opts: fastifyLogRotateOptions) {}
