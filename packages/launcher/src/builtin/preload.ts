import { MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

export const metadata = {
    id: 'builtin-preload',
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION,
    description: '预加载脚本',
    preload: true
} satisfies SEAModMetadata;

export default function (_context: SEAModContext<typeof metadata>) {
    return {
        install() {
            GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
            GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
        }
    } satisfies SEAModExport;
}
