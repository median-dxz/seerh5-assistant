import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('SAHelper', defaultStyle.core);

Alarm.show = function (text: number, callback: () => void) {
    log(`接管确认信息: ${text}`);
    BubblerManager.getInstance().showText(text);
    callback && callback();
};

export { };

