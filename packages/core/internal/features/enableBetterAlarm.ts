import { hookFn } from '../../common/utils.js';

declare const Alarm: {
    show: (text: string, cb: () => void) => void;
};
/** take over the alarm dialog */
export function enableBetterAlarm() {
    hookFn(Alarm, 'show', function (_, text: string, cb?: () => void) {
        console.log(`[info] 接管确认信息: ${text}`);
        BubblerManager.getInstance().showText(text, true);
        cb && cb();
    });
}
