import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export async function createContext(opts?: CreateFastifyContextOptions) {
    return {
        req: opts?.req,
        res: opts?.res,
    };
}
