import { initEvent } from './init/event';
import { initHelper } from './init/helper';
import { initModule } from './init/module';

const CoreLoader = {
    async load() {
        return new Promise<void>((resolve, reject) => {
            try {
                const sa_wait_login = async () => {
                    EventManager.addEventListener('game_login_success', sa_core_init, null);
                    OnlineManager.prototype.setSentryScope = () => {};
                    initModule();
                };

                const sa_core_init = async () => {
                    initEvent();
                    initHelper();
                    resolve();
                    window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
                    console.log(`[GameLoader]: SeerH5-Assistant Loaded Successfully!`);
                    EventManager.removeEventListener('game_login_success', sa_core_init, null);
                };

                if (window.SeerH5Ready) {
                    sa_core_init();
                } else {
                    window.addEventListener('seerh5_load', sa_wait_login, { once: true });
                }
            } catch (error) {
                reject(error);
            }
        }).catch((e) => {
            console.error(`[GameLoader]: Seerh5 assistant Load Failed!`);
        });
    },
};

export { CoreLoader };

