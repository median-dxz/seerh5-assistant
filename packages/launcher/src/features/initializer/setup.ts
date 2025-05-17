import { hookPrototype, NOOP, type SetupOptions } from '@sea/core';

import { IS_DEV } from '@/constants';

import { extendCore } from './extendCore';
import { extraLog } from './extraLog';

export type SetupMap = Record<string, SetupOptions['setup']>;

export const setupMap: SetupMap = {
    extendCore,
    extraLog: { fn: extraLog, flag: IS_DEV },
    canvasTabindex() {
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        canvas.setAttribute('tabindex', '-1');
    }
};

export const preloadSetupMap: SetupMap = {
    patchLogin() {
        GameInfo.online_gate = `api/taomee/online_gate`; // https://seerh5login.61.com/online_gate?is_ssl=0
        GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
    },
    fixSoundLoad() {
        hookPrototype(WebSoundManager, 'loadFightMusic', function (f, url) {
            url = SeerVersionController.getVersionUrl(url);
            return f.call(this, url);
        });
        hookPrototype(WebSoundManager, 'loadSound', function (f, url) {
            url = SeerVersionController.getVersionUrl(url);
            return f.call(this, url);
        });
    },
    disableSentry() {
        OnlineManager.prototype.setSentryScope = NOOP;
    }
};
