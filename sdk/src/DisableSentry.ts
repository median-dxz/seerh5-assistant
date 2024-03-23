import { NOOP } from '@sea/core';
import type { CreateModContext, ModExport } from '../lib/launcher';

export default async function DisableSentry(createContext: CreateModContext) {
    const { meta } = await createContext({
        meta: { core: '1.0.0-rc.2', id: 'DisableSentry', scope: 'median', preload: true }
    });
    const install = () => {
        OnlineManager.prototype.setSentryScope = NOOP;
    };
    return {
        meta,
        install
    } satisfies ModExport;
}
