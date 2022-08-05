import { ModuleListener } from './modulelistener.js';

let sa_init = async () => {
    ModuleListener.install();

    LoginService.loginCompleted = function () {
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this),
            EventManager.dispatchEventWith('LoginCompeted'),
            window.hideSerialID && window.hideSerialID();
        window.dispatchEvent(new CustomEvent('seerh5_login_completed'));
    };
    egret.lifecycle.onPause = function () {
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_PAUSE);
    };
    egret.lifecycle.onResume = function () {
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_RESUME);
    };
    SoundManager._instance._resumeMusic = function () {
        this.currSound && (this.soundChannel = this.currSound.play(this.position, 1)),
            this.soundChannel.addEventListener(egret.Event.SOUND_COMPLETE, this.onSoundComplete, this),
            this.checkMute(),
            (this.soundChannel.key = this.currSound.key);
    };
    CjsUtil._loadAnim = function () {
        if (!CjsUtil.animLoading && CjsUtil.animLoadList.length > 0) {
            CjsUtil.animLoading = !0;
            var e = CjsUtil.animLoadList.shift(),
                n = e.url;
            window.AdobeAn || (window.AdobeAn = {}),
                CjsUtil.JsResMap && CjsUtil.JsResMap[n]
                    ? CjsUtil._createAni(e, n)
                    : this.loadScript(n).then(
                          function () {
                              CjsUtil._createAni(e, n);
                          },
                          function () {
                              (CjsUtil.animLoading = !1), CjsUtil._loadAnim();
                          }
                      );
        }
    };

    window.Alarm.show = function (t, n) {
        console.log(`[SAHelper]: 接管确认信息: ${t}`);
        n && n();
    };
};

let sa_core_init = async () => {
    await import(/* webpackChunkName: "core" */ './core.js');
    await PetStorage2015InfoManager.getTotalInfo(() => {});
    window.dispatchEvent(new CustomEvent('core_ready'));
    import('./modloader.js');
};

window.addEventListener('seerh5_assisant_load', sa_init, { once: true });
window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });
