import { enableMapSet } from 'immer';

import { NULL, SAEventTarget } from '../common';
import { Hook } from '../constant';

import battle from '../battle/internal';
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
    betterSwitchPet();

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

/** better switch pet handler */
function betterSwitchPet() {
    PetBtnView.prototype.autoUse = function () {
        this.getMC().selected = !0;
        if (this.locked) throw new Error('该精灵已被放逐，无法出战');
        if (this.mc.selected) {
            if (this.hp <= 0) throw new Error('该精灵已阵亡');
            if (this.info.catchTime == FighterModelFactory.playerMode?.info.catchTime)
                throw new Error('该精灵已经出战');
            this.dispatchEvent(new PetFightEvent(PetFightEvent.CHANGE_PET, this.catchTime));
        } else if (!this.mc.selected) {
            this.dispatchEvent(new PetFightEvent('selectPet', this.catchTime));
        }
        this.getMC().selected = !1;
    };
}
