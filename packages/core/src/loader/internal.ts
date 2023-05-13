import { enableMapSet } from 'immer';
import battle from '../battle/internal';
import { NULL, SAEventTarget, wrapper } from '../common';
import { Hook } from '../constant';
import eventBus from '../event-bus/internal';
import pet from '../pet-helper/internal';
import event from './event';

export const InternalInitiator = {
    loaders: [] as { loader: Function; priority: number }[],

    push(loader: Function, priority: number) {
        this.loaders.push({ loader, priority });
    },

    load() {
        this.loaders.sort((a, b) => a.priority - b.priority).forEach((i) => i.loader());
    },
};

export async function enableBasic() {
    enableMapSet();

    OnlineManager.prototype.setSentryScope = NULL;
    ModuleManager.loadScript = loadScript;
    UIUtils = null;
    SocketEncryptImpl.prototype.log = logSocket;
    enableBackgroundHBCheck();
    cacheResourceUrl();

    InternalInitiator.push(event, 0);
    InternalInitiator.push(eventBus, 1);
    InternalInitiator.push(pet, 2);
    InternalInitiator.push(battle, 2);
}

function loadScript(this: ModuleManager, scriptName: string) {
    return new Promise<void>((resolve) => {
        var url = 'resource/app/' + scriptName + '/' + scriptName + '.js';
        RES.getResByUrl(
            url,
            function (script: string) {
                const o = document.createElement('script');
                o.type = 'text/javascript';
                while (script.startsWith('eval')) {
                    script = eval(script.match(/eval([^)].*)/)![1]);
                }
                script = script.replaceAll(/console\.log/g, 'logFilter');
                script = script.replaceAll(/console\.warn/g, 'warnFilter');
                o.text = `//@ sourceURL=${location.href + url + '\n'}${script}`;
                document.head.appendChild(o).parentNode!.removeChild(o);
                SAEventTarget.emit(Hook.Module.loadScript, scriptName);
                resolve();
            },
            this,
            'text'
        );
    });
}

function logSocket(this: SocketEncryptImpl, cmd: number, ...msg: string[]) {
    const logInfo = msg.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
    this.openIDs && this.openIDs.flat();
    if (this._isShowLog) {
        this.openIDs
            ? this.openIDs.includes(cmd) && console.log(logInfo)
            : !this.closeIDs.includes(cmd) && console.log(logInfo);
    }
}

/** enable background heartbeat check */
function enableBackgroundHBCheck() {
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

/** cache resource url */
function cacheResourceUrl() {
    sac.ResourceCache = new Map<string, string>();

    RES.getResByUrl = wrapper(RES.getResByUrl as (url: string) => Promise<egret.Texture>, undefined, (result, url) => {
        if (result.$bitmapData && result.$bitmapData.format === 'image' && result.$bitmapData.source) {
            sac.ResourceCache.set(url, result.$bitmapData.source.src);
        }
    });
}
