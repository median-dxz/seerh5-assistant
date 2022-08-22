const filterLogText = [
    /=.*?lifecycle.on.*=.*?$/,
    /^.*?Music position.*?[0-9]*$/,
    /sound length.*?[0-9]*$/,
    /module width.*?[0-9]*$/,
    /infos=*?>/,
    /^petbag constructor$/,
    /加载cjs 动画preview.*$/,
];

const filterWarnText = [
    /开始执行战斗动画/,
    /=.*?onUseSkill=.*=/,
    />.*?>面板.*?还没有.*$/,
    /head hit.*?index/,
    /PetID:.*?offsetX:/,
    /head.petInfo:/,
];

const sa_init = async () => {
    await import(/* webpackChunkName: "utils" */ '../utils.js').then((m) => {
        window.delay = m.delay;
        window.warpper = m.warpper;
    });

    LoginService.loginCompleted = function () {
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        EventManager.dispatchEventWith('LoginCompeted');
        hideSerialID && hideSerialID();
        window.dispatchEvent(new CustomEvent('seerh5_login_completed'));
    };

    console.log = new Proxy(console.log, {
        apply: function (target, _this, args) {
            if (args.every((v) => typeof v === 'string')) {
                args = args.filter((v) => !filterLogText.some((reg) => v.match(reg)));
                args.length > 0 && Reflect.apply(target, _this, args);
            } else {
                Reflect.apply(target, _this, args);
            }
        },
    });

    console.warn = new Proxy(console.warn, {
        apply: function (target, _this, args) {
            if (args.every((v) => typeof v === 'string')) {
                args = args.filter((v) => !filterWarnText.some((reg) => v.match(reg)));
                args.length > 0 && Reflect.apply(target, _this, args);
            } else {
                Reflect.apply(target, _this, args);
            }
        },
    });

    egret.lifecycle.onPause = () => {};
    egret.lifecycle.onResume = () => {};
    OnlineManager.prototype.setSentryScope = () => {};
    await import('./init/module.js');
};

let sa_core_init = async () => {
    window.SAEventManager = new EventTarget();

    await Promise.all([import('./init/socket.js'), import('./init/helper.js')]);
    await import('./init/event.js');
    await import(/* webpackChunkName: "core" */ './core.js').then((core) => {});
    // SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);

    window.dispatchEvent(new CustomEvent('core_ready'));

    await import('./modloader.js');
};

window.addEventListener('seerh5_assisant_load', sa_init, { once: true });
window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => {
        window.SAEventManager = new EventTarget();
    });
}
