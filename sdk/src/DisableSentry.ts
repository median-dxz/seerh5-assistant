import { NOOP } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import { coreVersion } from './common/coreVersion';

export const metadata = {
    core: coreVersion,
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
