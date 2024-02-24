import { initTRPC } from '@trpc/server';
import * as superjson from 'superjson';
import type { Context } from '../context.ts';

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    }
});

export const router = t.router;
export const procedure = t.procedure;
