/**
 * @description 将数据包加到待发送队列
 * 这个按序是对于每一个cmd来说的, 数据包没有标识来标记响应对应的请求, 所以要确保每一个cmd
 * 都是按顺序发出的, 要等待上一个cmd发送完毕才能发送下一个
 * 这里的resolve会在收包的时候resolve
 */
export async function sendByQueue(cmd: number, data: number[] = []) {
    return new Promise<ArrayBuffer | undefined>((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            data,
            (v: SocketEvent) => resolve(v.data?.buffer),
            (err: SocketErrorEvent) => reject(err.data)
        );
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
