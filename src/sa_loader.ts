import chalk from 'chalk';

chalk.level = 3;

import(/* webpackChunkName: "utils" */ './assistant/common')
    .then((utils) => {
        window.delay = utils.delay;
        window.wrapper = utils.wrapper;
        const sa_wait_login = async () => {
            EventManager.addEventListener('game_login_success', sa_core_init, null);
            OnlineManager.prototype.setSentryScope = () => {};
            await import('./assistant/_init/module');
        };

        const sa_core_init = async () => {
            await import('./assistant/_init/event');
            await Promise.all([import('./assistant/_init/socket'), import('./assistant/_init/helper')]);

            await import(/* webpackChunkName: "core" */ './assistant').then((core) => {
                window.SA = core;
                window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
                window.SACoreReady = true;
            });
            await import('./mod_loader');
            EventManager.removeEventListener('game_login_success', sa_core_init, null);
        };

        if (window.SACoreReady) {
            sa_core_init();
        } else {
            window.addEventListener('seerh5_assistant_load', sa_wait_login, { once: true });
        }
    })
    .catch((e) => {
        console.error(`[GameLoader]: Seerh5 assistant Load Failed!`);
    });

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
