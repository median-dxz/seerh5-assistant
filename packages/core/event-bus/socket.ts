import { tryGet } from '../common/utils.js';
import type { PetRoundInfo } from '../entity/index.js';
import type { ProxyPet } from '../pet-helper/PetDataManager.js';

type DataBuilder<T> = (data: ArrayBuffer) => T;
type OnReqHandler = (bytes: SAType.SocketRequestData) => void;
type OnResHandler<TCmd extends number> = (data: SocketData<TCmd>) => void;

type SocketData<TCmd extends number> = TCmd extends keyof SASocketData ? SASocketData[TCmd] : unknown;

export interface SocketEventHandler<TCmd extends number> {
    cmd: TCmd;
    req?: OnReqHandler;
    res?: OnResHandler<TCmd>;
}

export const SocketListener = {
    handlers: new Map<number, Set<SocketEventHandler<number>>>(),
    builders: new Map<number, DataBuilder<SocketData<number>>>(),

    subscribe<TCmd extends number>(cmd: TCmd, builder?: DataBuilder<SocketData<TCmd>>) {
        if (this.builders.has(cmd)) this.unsubscribe(cmd);
        if (builder) {
            this.builders.set(cmd, builder);
        }
    },

    unsubscribe(cmd: number) {
        if (this.builders.has(cmd)) {
            this.builders.delete(cmd);
            this.handlers.delete(cmd);
        }
    },

    on<TCmd extends number>(handler: SocketEventHandler<TCmd>) {
        const { cmd } = handler;
        tryGet(this.handlers, cmd).add(handler as unknown as SocketEventHandler<number>);
    },

    off<TCmd extends number>(handler: SocketEventHandler<TCmd>) {
        const { cmd } = handler;
        if (this.handlers.has(cmd)) {
            tryGet(this.handlers, cmd).delete(handler as unknown as SocketEventHandler<number>);
        }
    },

    once<TCmd extends number>(handler: SocketEventHandler<TCmd>) {
        const warpHandler: SocketEventHandler<TCmd> = {
            ...handler,
            res: (data) => {
                handler.res?.(data);
                SocketListener.off(warpHandler);
            },
        };
        SocketListener.on(warpHandler);
    },

    onReq(cmd: number, bytes: SAType.SocketRequestData) {
        if (!this.handlers.has(cmd)) {
            return;
        }
        const handlers = this.handlers.get(cmd)!;
        handlers.forEach((handler) => {
            handler.req?.(bytes);
        });
    },

    onRes(cmd: number, resBytes?: egret.ByteArray) {
        if (!this.handlers.has(cmd)) {
            return;
        }

        let data: unknown = null;

        if (this.builders.has(cmd) && resBytes) {
            const builder = this.builders.get(cmd)!;
            const buf = resBytes.rawBuffer;

            data = builder(buf);
        }

        const handlers = this.handlers.get(cmd)!;
        handlers.forEach((handler) => {
            handler.res?.(data);
        });
    },
};

export type SASocketData = {
    2505: readonly [PetRoundInfo, PetRoundInfo]; // NOTE_USE_SKILL
    2301: ProxyPet; // GET_PET_INFO
    2304: PetTakeOutInfo; // PET_RELEASE
    43706: readonly [ProxyPet[], ProxyPet[]]; // GET_PET_INFO_BY_ONCE
};
