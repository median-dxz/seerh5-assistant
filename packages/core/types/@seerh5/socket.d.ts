declare class SocketConnection {
    static addCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObject?: T): void;
    static removeCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObject?: T): void;
    static sendByQueue(cmd: number, data: number[], resolver?: CallableFunction, rejecter?: CallableFunction): void;
    static get mainSocket(): SocketEncryptImpl;
}

declare class SocketEncryptImpl extends egret.WebSocket {
    static getCmdLabel(cmd: number): string;
    _isShowLog: boolean;
    connected: boolean;
    openIDs: number[];
    closeIDs: number[];
    reConnecting: boolean;
    addCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObj: T): void;
    removeCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObj: T): void;
    dispatchCmd(cmd: number, headInfo: HeadInfo, buf?: egret.ByteArray): void;
    log(cmd: number, ...msg: string[]): void;
    send(cmd: number, data: seerh5.SocketRequestData): number;
    parseData(data: egret.ByteArray): void;
}

declare class HeadInfo {
    get cmdID(): number;
    get result(): number;
    get userID(): number;
    get version(): string;
}
