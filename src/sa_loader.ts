import chalk from 'chalk';

chalk.level = 3;

const sa_wait_login = async () => {
    EventManager.addEventListener('LoginCompeted', sa_core_init, { once: true });
    OnlineManager.prototype.setSentryScope = () => {};
    await import('./assistant/_init/module');
};

const sa_core_init = async () => {
    await Promise.all([import('./assistant/_init/socket'), import('./assistant/_init/helper')]);
    await import('./assistant/_init/event');
    await import(/* webpackChunkName: "core" */ './assistant').then((core) => {
        window.SA = core;
        window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
        window.SACoreReady = true;
    });
    await import('./mod_loader');
};

import(/* webpackChunkName: "utils" */ './assistant/common').then((utils) => {
    window.delay = utils.delay;
    window.wrapper = utils.wrapper;
    window.SAEventTarget = new EventTarget();
});

if (window.SACoreReady) {
    sa_core_init();
} else {
    window.addEventListener('seerh5_assistant_load', sa_wait_login, { once: true });
}

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
