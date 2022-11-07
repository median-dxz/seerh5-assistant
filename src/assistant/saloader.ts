import chalk from 'chalk';

chalk.level = 3;

const sa_wait_login = async () => {
    LoginService.loginCompleted = function () {
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        EventManager.dispatchEventWith('LoginCompeted');
        hideSerialID && hideSerialID();
        window.dispatchEvent(new CustomEvent('seerh5_login_completed'));
    };

    egret.lifecycle.onPause = () => {};
    egret.lifecycle.onResume = () => {};
    OnlineManager.prototype.setSentryScope = () => {};
    await import('./_init/module');
};

const sa_core_init = async () => {
    await Promise.all([import('./_init/socket'), import('./_init/helper')]);
    await import('./_init/event');
    await import(/* webpackChunkName: "core" */ './core').then((core) => {
        window.SA = core;
        window.dispatchEvent(new CustomEvent('seerh5_assistant_ready'));
        window.SACoreReady = true;
    });
    await import('./mod-loader');
};

import(/* webpackChunkName: "utils" */ '../utils').then((utils) => {
    window.delay = utils.delay;
    window.wrapper = utils.wrapper;
    window.SAEventTarget = new EventTarget();
});

if (window.SACoreReady) {
    sa_core_init();
} else {
    window.addEventListener('seerh5_assistant_load', sa_wait_login, { once: true });
    window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });
}

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
