import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('SAHelper', defaultStyle.core);

Alarm.show = function (text: string, callback: () => void) {
    log(`接管确认信息: ${text}`);
    BubblerManager.getInstance().showText(text);
    callback && callback();
};

// enable background heartbeat check
let timer: number | undefined = undefined;

egret.lifecycle.onPause = () => {
    const { setInterval } = window;
    timer = setInterval(() => {
        if (!SocketConnection.mainSocket.connected) return;
        SystemTimerManager.queryTime();
        SystemTimerManager._tickFun.forEach((f: Function) => f());
    }, 3000);
};

egret.lifecycle.onResume = () => {
    clearInterval(timer);
    timer = undefined;
};

export { };

