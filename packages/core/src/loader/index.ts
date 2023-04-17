import { HookLoader } from './event';
import { InternalLoader } from './internal';

import { EventHandlerLoader } from '../event-handler/internal';
import { PetHelperLoader } from '../pet-helper/internal';

import { RegisteredMods } from '../mod-manager';

import { defaultStyle, SaModuleLogger } from '../logger';

const log = SaModuleLogger('SALoader', defaultStyle.core);

export async function CoreLoader() {
    return new Promise<boolean>((resolve, reject) => {
        const sa_wait_login = async () => {
            OnlineManager.prototype.setSentryScope = () => {};
            await InternalLoader();
            EventManager.addEventListener('event_first_show_main_panel', sa_core_init, null);
        };

        const sa_core_init = async () => {
            EventManager.removeEventListener('event_first_show_main_panel', sa_core_init, null);
            HookLoader();
            await new Promise<void>((r) => PetStorage2015InfoManager.getMiniInfo(r));
            resolve(true);
            sac.SacReady = true;
            sac.Mods = RegisteredMods;
            EventHandlerLoader();
            PetHelperLoader();
            window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
            log(`SeerH5-Assistant Core Loaded Successfully!`);
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
