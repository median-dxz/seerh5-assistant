import type { AnyFunction } from '../common/utils.js';
import { NOOP, SEAHookEmitter, hookPrototype } from '../common/utils.js';
import { Hook } from '../constant/index.js';

import battleInit from '../battle/internal.js';
import registerListeners from '../emitter/internal.js';
import registerEngine from '../engine/internal.js';
import petInit from '../pet-helper/internal.js';
import registerHooks from './registerHooks.js';

export const InternalInitiator = {
    loaders: [] as { loader: AnyFunction; priority: number }[],

    push(loader: AnyFunction, priority: number) {
        this.loaders.push({ loader, priority });
    },

    load() {
        this.loaders
            .sort((a, b) => a.priority - b.priority)
            .forEach((i) => {
                i.loader();
            });
    },
};

export function enableBasic() {
    OnlineManager.prototype.setSentryScope = NOOP;
    ModuleManager.loadScript = loadScript;
    SocketEncryptImpl.prototype.log = socketLogger;
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
    fixSoundLoad();

    // eslint-disable-next-line
    Core.init();

    enableBackgroundHeartBeatCheck();

    InternalInitiator.push(registerHooks, 0);
    InternalInitiator.push(registerListeners, 1);
    InternalInitiator.push(petInit, 2);
    InternalInitiator.push(battleInit, 2);
    InternalInitiator.push(registerEngine, 3);
}

function loadScript(this: ModuleManager, scriptName: string) {
    return new Promise<void>((resolve) => {
        const url = 'resource/app/' + scriptName + '/' + scriptName + '.js';
        RES.getResByUrl(
            url,
            function (script: string) {
                const o = document.createElement('script');
                o.type = 'text/javascript';
                while (script.startsWith('eval')) {
                    script = eval(script.match(/eval([^)].*)/)![1]) as string;
                }
                script = script.replaceAll(/console\.log/g, 'logFilter');
                script = script.replaceAll(/console\.warn/g, 'warnFilter');
                o.text = `//@ sourceURL=http://seerh5.61.com/${url + '\n'}${script}`;
                document.head.appendChild(o).parentNode!.removeChild(o);
                SEAHookEmitter.emit(Hook.Module.loadScript, scriptName);
                resolve();
            },
            this,
            'text'
        );
    });
}

function socketLogger(this: SocketEncryptImpl, cmd: number, ...msg: string[]) {
    const logInfo = msg.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
    this.openIDs && this.openIDs.flat();
    if (this._isShowLog) {
        this.openIDs
            ? this.openIDs.includes(cmd) && console.log(logInfo)
            : !this.closeIDs.includes(cmd) && console.log(logInfo);
    }
}

/** enable background heartbeat check */
function enableBackgroundHeartBeatCheck() {
    let timer: number | undefined = undefined;

    egret.lifecycle.onPause = () => {
        const { setInterval } = window;
        timer = setInterval(() => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        }, 5000);
    };

    egret.lifecycle.onResume = () => {
        clearInterval(timer);
        timer = undefined;
    };
}

function fixSoundLoad() {
    hookPrototype(WebSoundManager, 'loadFightMusic', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
    hookPrototype(WebSoundManager, 'loadSound', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
}
