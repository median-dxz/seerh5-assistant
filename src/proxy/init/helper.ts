export {};

Alarm.show = function (text, callback) {
    console.log(`[SAHelper]: 接管确认信息: ${text}`);
    BubblerManager.getInstance().showText(text);
    callback && callback();
};