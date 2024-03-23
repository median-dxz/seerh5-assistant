import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { CreateModContext, ModExport } from '@/sea-launcher';

export default async function (createModContext: CreateModContext) {
    const { meta } = await createModContext({
        meta: {
            id: 'builtin-preload',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '预加载脚本',
            preload: true
        }
    });

    return {
        meta,
        install() {
            GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
            GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
        }
    } satisfies ModExport;
}
