import type { AnyFunction } from '../common/utils.js';
import { SocketEventEmitter } from '../emitter/index.js';

/**
 * @description 将数据包加到待发送队列
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

/**
 * @description 返回服务器响应cmd后才resolve的promise
 */
export async function sendWithReceivedPromise(cmd: number, fn: AnyFunction) {
    if (!fn) return;

    return new Promise<unknown>((resolve) => {
        SocketEventEmitter.once(cmd, 'receive', resolve);
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
