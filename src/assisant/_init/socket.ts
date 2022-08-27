export { };
SocketEncryptImpl.prototype.log = function (cmdid: number, ...msg: string[]) {
    const logInfo = msg.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
    this.openIDs && this.openIDs.flat();
    if (this._isShowLog) {
        this.openIDs
            ? this.openIDs.indexOf(cmdid) >= 0 && console.log(logInfo)
            : this.closeIDs.indexOf(cmdid) < 0 && console.log(logInfo);
    }
};

// SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);