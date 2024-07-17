declare class LifeCycleManager {
    static readonly LIFE_CYCLE_PAUSE: 'LIFE_CYCLE_PAUSE';
    static readonly LIFE_CYCLE_RESUME: 'LIFE_CYCLE_RESUME';
}
/** enable background heartbeat check */
export function backgroundHeartBeatCheck() {
    let timer: number | undefined = undefined;

    egret.lifecycle.onPause = () => {
        const { setInterval } = window;
        timer = setInterval(() => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        }, 3000);
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_PAUSE);
    };

    egret.lifecycle.onResume = () => {
        clearInterval(timer);
        timer = undefined;
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_RESUME);
    };

    setInterval(
        () => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        },
        4000 + Math.trunc(Math.random() * 1000)
    );
}
