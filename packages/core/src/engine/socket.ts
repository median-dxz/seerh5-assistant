/**
 * @description 将数据包加到待发送队列
 */
export async function sendByQueue(cmd: number, data: Array<number> | number = []) {
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
export async function sendWithReceivedPromise(cmd: number, fn: VoidFunction) {
    if (!fn) return;
    return new Promise<ArrayBuffer>((resolve, reject) => {
        new Promise<{ data: ArrayBuffer; resolver: CallBack<ArrayBuffer> }>((resolve, reject) => {
            function resolver(data: ArrayBuffer) {
                resolve({ data, resolver });
            }
            SocketConnection.addCmdListener(cmd, resolver);
        }).then(({ data, resolver }) => {
            SocketConnection.removeCmdListener(cmd, resolver);
            resolve(data);
        });
        fn();
    });
}

export async function multiValue(...values: number[]): Promise<number[]> {
    if (!values) return [];
    return KTool.getMultiValueAsync(values);
}

export async function bitSet(...values: number[]): Promise<boolean[]> {
    if (!values) return [];
    return KTool.getBitSetAsync(values).then((r) => r.map(Boolean));
}

export async function playerInfo(...values: number[]): Promise<number[]> {
    if (!values) return [];
    return KTool.getPlayerInfoValueAsync(values);
}
