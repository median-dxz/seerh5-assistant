import { SaModuleLogger, defaultStyle } from '../common/utils.js';
import { InternalInitiator, enableBasic } from './internal.js';

const log = SaModuleLogger('SALoader', defaultStyle.core);

export async function CoreLoader() {
    return new Promise<boolean>((resolve, reject) => {
        const sa_wait_login = async () => {
            await enableBasic();
            EventManager.addEventListener('event_first_show_main_panel', sa_core_init, null);
        };

        const sa_core_init = async () => {
            EventManager.removeEventListener('event_first_show_main_panel', sa_core_init, null);

            InternalInitiator.load();

            resolve(true);
            sac.SacReady = true;

            window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
            log(`SeerH5-Assistant Core Loaded Successfully!`);
        };

        if (typeof sac !== 'undefined' && sac.SeerH5Ready) {
            if (sac.SacReady) {
                resolve(true);
            } else {
                sa_core_init();
            }
        } else {
            window.addEventListener('seerh5_load', sa_wait_login, { once: true });
        }
    });
}
