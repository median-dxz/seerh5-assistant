import { HookLoader } from './event';
import { InternalLoader } from './internal';

import { defaultStyle, SaModuleLogger } from '../logger';
import { RegisteredMods } from '../mod-manager';

const log = SaModuleLogger('SALoader', defaultStyle.core);

export async function CoreLoader() {
    return new Promise<boolean>((resolve, reject) => {
        const sa_wait_login = async () => {
            EventManager.addEventListener('game_login_success', sa_core_init, null);
            OnlineManager.prototype.setSentryScope = () => {};
            InternalLoader();
        };

        const sa_core_init = async () => {
            HookLoader();
            resolve(true);
            sac.SacReady = true;
            sac.Mods = RegisteredMods;
            window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
            log(`SeerH5-Assistant Core Loaded Successfully!`);
            EventManager.removeEventListener('game_login_success', sa_core_init, null);
        };
        
        if (typeof sac !== 'undefined' && sac.SeerH5Ready) {
            if (sac.SacReady) {
                return true;
            } else {
                sa_core_init();
            }
        } else {
            window.addEventListener('seerh5_load', sa_wait_login, { once: true });
        }
    });
}
