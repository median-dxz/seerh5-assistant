export { SendByQueue as SocketSendByQueue };
export { ReceivedPromise as SocketReceivedPromise };

/**
 * @description 将数据包加到待发送队列
 */
async function SendByQueue(cmd: number, data: Array<number> | number = []) {
    let _data = typeof data === 'number' ? [data] : data;
    return new Promise<ArrayBuffer>((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            _data,
            (v: any) => resolve(v.data?.buffer),
            (err: any) => reject(err.data?.buffer)
        );
    });
}

/**
 * @description 返回服务器响应cmd后才resolve的promise
 */
async function ReceivedPromise(cmd: number, fn: () => void) {
    if (!fn) return;
    return new Promise<void>((resolve, reject) => {
        new Promise((resolve: (value: () => void) => void, reject) => {
            function resolver() {
                resolve(resolver);
            }
            SocketConnection.addCmdListener(cmd, resolver);
        }).then((v) => {
            SocketConnection.removeCmdListener(cmd, v);
            resolve();
        });
        fn();
    });
}
