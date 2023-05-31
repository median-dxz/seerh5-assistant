import { tryGet } from '../common/utils.js';
import type { PetRoundInfo } from '../entity/index.js';
import type { ProxyPet } from '../pet-helper/ProxyPet.js';

type DataBuilder<T> = (data: ArrayBuffer) => T;
type OnReqHandler = (bytes: SAType.SocketRequestData) => void;
type OnResHandler<TCmd extends number> = (data: SocketData<TCmd>) => void;

type SocketData<TCmd> = TCmd extends keyof SASocketData ? SASocketData[TCmd] : null;

export interface SocketEventHandler<TCmd extends number> {
    cmd: TCmd;
    req?: OnReqHandler;
    res?: OnResHandler<TCmd>;
}

export const SocketListener = {
    handlers: new Map<number, Set<SocketEventHandler<any>>>(),
    builders: new Map<number, DataBuilder<SocketData<any>>>(),

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
        tryGet(this.handlers, handler.cmd).add(handler);
    },

    off<TCmd extends number>(handler: SocketEventHandler<TCmd>) {
        if (this.handlers.has(handler.cmd)) {
            tryGet(this.handlers, handler.cmd).delete(handler);
        }
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

    onRes<TCmd extends number>(cmd: TCmd, bytes?: egret.ByteArray) {
        if (!this.handlers.has(cmd)) {
            return;
        }

        let data: any = null;

        if (this.builders.has(cmd) && bytes) {
            const builder = this.builders.get(cmd)!;
            const buf = bytes.rawBuffer;

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
