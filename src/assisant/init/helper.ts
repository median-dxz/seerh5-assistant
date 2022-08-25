export { };
Alarm.show = function (text: number, callback: () => void) {
    console.log(`[SAHelper]: 接管确认信息: ${text}`);
    BubblerManager.getInstance().showText(text);
    callback && callback();
};