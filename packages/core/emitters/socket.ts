import type { EventData, Handler } from '../common/EventTarget.js';
import { SEAEventTarget } from '../common/EventTarget.js';
import type { SocketResponseMap } from '../constant/type.js';

type SocketData<TCmd extends number> = EventData<TCmd, SocketResponseMap, undefined>;

type DataBuilder<T> = (data: ArrayBuffer) => T;
export type SocketSendHandler = Handler<seerh5.SocketRequestData>;
export type SocketReceiveHandler<TCmd extends number> = Handler<SocketData<TCmd>>;

type SocketEvent = 'send' | 'receive';

type HandlerType<TCmd extends number> = {
    send: SocketSendHandler;
    receive: SocketReceiveHandler<TCmd>;
};

type GetHandlerType<E extends SocketEvent, TCmd extends number> = HandlerType<TCmd>[E];

export const SocketEventEmitter = {
    builders: new Map<number, DataBuilder<unknown>>(),
    eventTarget: {
        send: new SEAEventTarget(),
        receive: new SEAEventTarget<SocketResponseMap>(),
    },

    /** 订阅一个cmd并添加builder, 注意该操作会取消之前的builder以及所有订阅 */
    subscribe<TCmd extends number>(cmd: TCmd | keyof SocketResponseMap, builder?: DataBuilder<SocketData<TCmd>>) {
        if (this.builders.has(cmd)) this.unsubscribe(cmd);
        if (builder) {
            this.builders.set(cmd, builder);
        }
    },

    unsubscribe(cmd: number) {
        if (this.builders.has(cmd)) {
            this.builders.delete(cmd);

            const { send: req, receive: res } = this.eventTarget;

            [...req.handlers].forEach(([handler]) => {
                req.off(cmd, handler as Handler<unknown>);
            });

            [...res.handlers].forEach(([handler]) => {
                res.off(cmd, handler as Handler<unknown>);
            });
        }
    },

    dispatchSend(cmd: number, bytes: seerh5.SocketRequestData) {
        const { send: et } = this.eventTarget;
        et.emit(cmd, bytes);
    },

    dispatchReceive<TCmd extends number>(cmd: TCmd | keyof SocketResponseMap, resBytes?: egret.ByteArray) {
        const { receive: et } = this.eventTarget;
        if (this.builders.has(cmd) && resBytes) {
            const builder = this.builders.get(cmd) as DataBuilder<SocketData<TCmd>>;
            const buf = resBytes.rawBuffer;

            et.emit(cmd, builder(buf));
        } else {
            et.emit(cmd);
        }
    },

    on<TCmd extends number, TEvent extends SocketEvent>(
        cmd: TCmd | keyof SocketResponseMap,
        type: TEvent,
        handler: GetHandlerType<TEvent, TCmd>
    ) {
        this.eventTarget[type].on(cmd, handler as Handler<unknown>);
    },

    off<TCmd extends number, TEvent extends SocketEvent>(
        cmd: TCmd | keyof SocketResponseMap,
        type: TEvent,
        handler: GetHandlerType<TEvent, TCmd>
    ) {
        this.eventTarget[type].off(cmd, handler as Handler<unknown>);
    },

    once<TCmd extends number, TEvent extends SocketEvent>(
        cmd: TCmd | keyof SocketResponseMap,
        type: TEvent,
        handler: GetHandlerType<TEvent, TCmd>
    ) {
        this.eventTarget[type].once(cmd, handler as Handler<unknown>);
    },
};
