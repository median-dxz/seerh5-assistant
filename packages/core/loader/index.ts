import { InternalInitiator, enableBasic } from './internal.js';

export async function CoreLoader() {
    return new Promise<boolean>((resolve) => {
        const sa_wait_login = () => {
            enableBasic();
            EventManager.addEventListener('event_first_show_main_panel', sa_core_init, null);
        };

        const sa_core_init = () => {
            EventManager.removeEventListener('event_first_show_main_panel', sa_core_init, null);

            InternalInitiator.load();

            resolve(true);

            window.sea.CoreReady = true;

            window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
        };

        const { sea } = window;

        if (typeof sea !== 'undefined' && sea.SeerH5Ready) {
            if (sea.CoreReady) {
                resolve(true);
            } else {
                sa_core_init();
            }
        } else {
            window.addEventListener('seerh5_load', sa_wait_login, { once: true });
        }
    });
}
