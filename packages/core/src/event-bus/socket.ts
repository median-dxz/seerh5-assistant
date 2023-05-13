import { tryGet } from '../common';
import type { PetRoundInfo } from '../entity';
import type { ProxyPet } from '../pet-helper/ProxyPet';

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
    cmdListeners: new Map<number, (e: SocketEvent) => void>(),

    subscribe<TCmd extends number>(cmd: TCmd, builder?: DataBuilder<SocketData<TCmd>>) {
        if (this.cmdListeners.has(cmd)) this.unsubscribe(cmd);

        this.cmdListeners.set(cmd, (e: SocketEvent) => {
            let data: SocketData<TCmd> | null = null;
            if (e.data != null && builder != null) {
                const buf = (e.data as egret.ByteArray).rawBuffer;
                data = builder(buf);
            }
            this.onRes(cmd, data);
        });

        SocketConnection.addCmdListener(cmd, this.cmdListeners.get(cmd)!);
    },

    unsubscribe(cmd: number) {
        if (this.cmdListeners.has(cmd)) {
            SocketConnection.removeCmdListener(cmd, this.cmdListeners.get(cmd)!);
            this.cmdListeners.delete(cmd);
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

    onRes<TCmd extends number>(cmd: TCmd, data: SocketData<TCmd> | null) {
        if (!this.handlers.has(cmd)) {
            return;
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
