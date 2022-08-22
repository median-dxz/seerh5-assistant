/**
 * @description 将数据包加到待发送队列
 * @param {Number} cmd 命令id
 * @param {Array} data 数据数组
 */
async function SendByQueue(cmd, data) {
    return new Promise((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            data,
            (v) => resolve(v),
            (err) => reject(err)
        );
    });
}
export { SendByQueue as SocketSendByQueue };

/**
 * @description 将数据包加到待发送队列
 * @param {Number} cmd 命令id
 * @param {()=>any} fn 带发包操作的函数
 */
async function ReceivedPromise(cmd, fn) {
    if (!fn) return;
    return /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
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
    );
}
export { ReceivedPromise as SocketReceivedPromise };
