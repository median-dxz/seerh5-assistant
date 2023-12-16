declare global {
    interface SocketConnection {
        addCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObject?: T): void;
        removeCmdListener<T>(cmd: number, callback: seerh5.Callback<T>, thisObject?: T): void;
        sendByQueue(
            cmd: number,
            data: (number | egret.ByteArray)[],
            resolver?: CallableFunction,
            rejecter?: CallableFunction
        ): void;
        get mainSocket(): SocketEncryptImpl;
    }
    const SocketConnection: SocketConnection;

    class SocketEncryptImpl extends egret.WebSocket {
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

    class HeadInfo {
        get cmdID(): number;
        get result(): number;
        get userID(): number;
        get version(): string;
    }
}

export { };

