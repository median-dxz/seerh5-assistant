const sa_init = async () => {
    LoginService.loginCompleted = function () {
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        EventManager.dispatchEventWith('LoginCompeted');
        hideSerialID && hideSerialID();
        window.dispatchEvent(new CustomEvent('seerh5_login_completed'));
    };

    egret.lifecycle.onPause = () => {};
    egret.lifecycle.onResume = () => {};
    OnlineManager.prototype.setSentryScope = () => {};
    await import('./init/module');
};

let sa_core_init = async () => {
    await Promise.all([import('./init/socket'), import('./init/helper')]);
    await import('./init/event');
    await import(/* webpackChunkName: "core" */ './core').then((core) => {
        window.SA = core;
        window.dispatchEvent(new CustomEvent('core_ready'));
    });
    await import('./modloader');
};

import(/* webpackChunkName: "utils" */ '../utils').then((utils) => {
    window.delay = utils.delay;
    window.warpper = utils.warpper;
    window.SAEventTarget = new EventTarget();
});

window.addEventListener('seerh5_assisant_load', sa_init, { once: true });
window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });
