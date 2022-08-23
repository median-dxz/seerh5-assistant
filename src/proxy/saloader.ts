const sa_init = async () => {
    await import(/* webpackChunkName: "utils" */ '../utils').then((m) => {
        window.delay = m.delay;
        window.warpper = m.warpper;
    });

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
    window.SAEventManager = new EventTarget();

    await Promise.all([import('./init/socket.ts'), import('./init/helper')]);
    await import('./init/event');
    await import(/* webpackChunkName: "core" */ './core.js').then((core) => {});
    // SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);

    window.dispatchEvent(new CustomEvent('core_ready'));

    await import('./modloader.js');
};

window.addEventListener('seerh5_assisant_load', sa_init, { once: true });
window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
