/**
 * @description 将数据包加到待发送队列
 * 这个按序是对于每一个cmd来说的, 数据包没有标识来标记响应对应的请求, 所以要确保每一个cmd
 * 都是按顺序发出的, 要等待上一个cmd发送完毕才能发送下一个
 * 这里的resolve会在收包的时候resolve
 */
export async function sendByQueue(cmd: number, data: Parameters<SocketConnection['sendByQueue']>[1] = []) {
    return new Promise<ArrayBuffer | undefined>((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            data,
            (v: SocketEvent) => {
                resolve(v.data?.rawBuffer);
            },
            (err: SocketErrorEvent) => {
                reject(err.data ?? new Error(`SendByQueue Failed: cmd: ${cmd} errno: ${err.headInfo.result}`));
            }
        );
    });
}

const readResponse = (response?: ArrayBuffer) => {
    if (!response) return [];
    const data = new egret.ByteArray(response);
    const result = [];
    const length = data.readUnsignedInt();
    for (let i = 0; i < length; i++) {
        result.push(data.readUnsignedInt());
    }
    return result;
};

export async function multiValue(...values: number[]): Promise<number[]> {
    if (values.length === 0) return [];
    const buf = new egret.ByteArray();
    values.forEach((v) => buf.writeInt(v));
    buf.position = 0;
    return sendByQueue(CommandID.GET_MULTI_FOREVER, [values.length, buf]).then(readResponse);
}

export async function bitSet(...values: number[]): Promise<boolean[]> {
    if (values.length === 0) return [];
    const buf = new egret.ByteArray();
    values.forEach((v) => buf.writeUnsignedInt(v));
    buf.position = 0;
    return sendByQueue(CommandID.BATCH_GET_BITSET, [values.length, buf]).then((r) => {
        if (!r) return [];
        const data = new Uint8Array(r);
        // 大端数据 ByteArray也是默认大端
        const length = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
        return Array.from(data.slice(4, 4 + length)).map(Boolean);
    });
}

export async function playerInfo(...values: number[]): Promise<number[]> {
    if (values.length === 0) return [];
    const buf = new egret.ByteArray();
    values.forEach((v) => buf.writeInt(v));
    buf.position = 0;
    return sendByQueue(CommandID.GAME_GET_PLAYER_INFO, [values.length, buf]).then(readResponse);
}
