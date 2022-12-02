declare class SocketConnection {
    static addCmdListener<T>(cmd: number, callback: CallBack<T>, thisObject?: T): void;
    static removeCmdListener<T>(cmd: number, callback: CallBack<T>, thisObject?: T): void;
    static sendByQueue(cmd: number, data: number[], resolver: Function, rejecter: Function): void;
    static get mainSocket(): SocketEncryptImpl;
}

declare class SocketEncryptImpl {
    _isShowLog: boolean;
    connected: boolean;
    openIDs: number[];
    closeIDs: number[];
    log(cmd: number, ...msg: string[]): void;
}
