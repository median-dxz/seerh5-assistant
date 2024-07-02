import { scope } from '@/common/constants.json';
import { NOOP } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

export const metadata = {
    id: 'DisableSentry',
    scope,
    version: '1.0.0',
    preload: true
} satisfies SEAModMetadata;

export default async function DisableSentry(ctx: SEAModContext<typeof metadata>) {
    return {
        install() {
            OnlineManager.prototype.setSentryScope = NOOP;
        }
    } satisfies SEAModExport;
}
