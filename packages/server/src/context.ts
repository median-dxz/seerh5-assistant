import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

interface BuildSEALContextOptions {
    appRoot: string;
}

export function buildSEALContext(opts: BuildSEALContextOptions) {
    const { appRoot } = opts;
    return async function createContext(opts: CreateFastifyContextOptions) {
        return {
            req: opts.req,
            res: opts.res,
            appRoot,
        };
    };
}

type CreateContext = ReturnType<typeof buildSEALContext>;
export type Context = Awaited<ReturnType<CreateContext>>;
