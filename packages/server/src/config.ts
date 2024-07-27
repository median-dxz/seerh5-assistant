import path from 'node:path';

// 对应 node 环境(未打包) 与 pkg 环境(带snapshot的CJS)
const base = import.meta?.dirname ?? process.cwd();

console.log(`base: ${base}`);

const envPath = path.resolve(base, '../.env');

const schema = {
    type: 'object',
    required: ['PORT', 'APP_ROOT'],
    properties: {
        PORT: {
            type: 'string',
            default: 2147
        },
        APP_ROOT: {
            type: 'string',
            default: path.resolve(base, '../')
        }
    }
};

const envOptions = {
    schema,
    dotenv: {
        path: envPath
    }
};

export { envOptions };

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            PORT: number;
            APP_ROOT: string;
        };
    }
}
