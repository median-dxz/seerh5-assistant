declare class SocketConnection {
    static addCmdListener<T>(cmd: number, callback: CallBack<T>, thisObject?: T): void;
    static removeCmdListener<T>(cmd: number, callback: CallBack<T>, thisObject?: T): void;
    static sendByQueue(cmd: number, data: number[], resolver?: Function, rejecter?: Function): void;
    static get mainSocket(): SocketEncryptImpl;
}

declare class SocketEncryptImpl extends egret.WebSocket {
    static getCmdLabel(cmd: number): string;
    _isShowLog: boolean;
    connected: boolean;
    openIDs: number[];
    closeIDs: number[];
    addCmdListener<T>(cmd: number, callback: CallBack<T>, thisObj: T): void;
    removeCmdListener<T>(cmd: number, callback: CallBack<T>, thisObj: T): void;
    dispatchCmd(cmd: number, headInfo: HeadInfo, buf?: egret.ByteArray): void;
    log(cmd: number, ...msg: string[]): void;
    send(cmd: number, data: Array<number | egret.ByteArray>): number | Promise<number>;
    parseData(data: egret.ByteArray): void;
}

declare class HeadInfo {
    get cmdID(): number;
    get result(): number;
    get userID(): number;
    get version(): string;
}
