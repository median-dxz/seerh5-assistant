import { NOOP } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

export const metadata = {
    core: '1.0.0-rc.2',
    id: 'DisableSentry',
    scope: 'median',
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
