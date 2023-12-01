/* eslint-disable */

declare const Alarm: any;
/** take over the alarm dialog */
export function enableBetterAlarm() {
    Alarm.show = function (text: string, cb: () => void) {
        console.log(`[info] 接管确认信息: ${text}`);
        BubblerManager.getInstance().showText(text, true);
        cb && cb();
    };
}
