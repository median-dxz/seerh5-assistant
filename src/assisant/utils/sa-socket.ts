/**
 * @description 将数据包加到待发送队列
 */
async function SendByQueue(cmd: number, data: Array<number>) {
    return new Promise((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            data,
            (v: unknown) => resolve(v),
            (err: unknown) => reject(err)
        );
    });
}
export { SendByQueue as SocketSendByQueue };

/**
 * @description 将数据包加到待发送队列
 */
async function ReceivedPromise(cmd: number, fn: () => void) {
    if (!fn) return;
    return new Promise<void>((resolve, reject) => {
        new Promise((resolve, reject) => {
            function resolver() {
                resolve(resolver);
            }
            SocketConnection.addCmdListener(cmd, resolver);
        }).then((v) => {
            SocketConnection.removeCmdListener(v);
            resolve();
        });
        fn();
    })

}
export { ReceivedPromise as SocketReceivedPromise } 