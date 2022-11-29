declare namespace SocketConnection {
    function addCmdListener(cmdId: number, callback: CallBack): void;
    function removeCmdListener(cmdId: number, callback: CallBack): void;
    function sendByQueue(cmd: number, data: Array<number>, resolve: Function, reject: Function): void;
    const mainSocket: any;
}
