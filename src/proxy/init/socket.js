// @ts-nocheck
export {};

SocketEncryptImpl.prototype.log = function (n, ...e) {
    const logInfo = e.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
    this.openIDs && this.openIDs.flat();
    if (this._isShowLog) {
        this.openIDs
            ? this.openIDs.indexOf(n) >= 0 && console.log(logInfo)
            : this.closeIDs.indexOf(n) < 0 && console.log(logInfo);
    }
};