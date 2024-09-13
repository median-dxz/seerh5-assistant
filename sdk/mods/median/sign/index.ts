import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

import { scope } from '@/median/constants.json';

import { daily } from './daily';
import { teamSign } from './team';
import { teamDispatch } from './team-dispatch';
import { vip } from './vip';

export const metadata = {
    id: 'SignPresets',
    scope,
    version: '1.0.0',
    description: '日常签到'
} satisfies SEAModMetadata;

export default function Sign({ logger }: SEAModContext<typeof metadata>): SEAModExport {
    return {
        tasks: [...daily(logger), teamDispatch(logger), ...teamSign(logger), ...vip(logger)]
    };
}
