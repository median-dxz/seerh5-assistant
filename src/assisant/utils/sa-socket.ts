export { SendByQueue as SocketSendByQueue };
export { ReceivedPromise as SocketReceivedPromise };

/**
 * @description 将数据包加到待发送队列
 */
export async function SendByQueue(cmd: number, data: Array<number> | number = []) {
    let _data = typeof data === 'number' ? [data] : data;
    return new Promise((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            _data,
            (v: unknown) => resolve(v),
            (err: unknown) => reject(err)
        );
    });
}

/**
 * @description 将数据包加到待发送队列
 */
export async function ReceivedPromise(cmd: number, fn: () => void) {
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
