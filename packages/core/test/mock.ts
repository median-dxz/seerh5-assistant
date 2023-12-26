import {vi} from "vitest";
import type {SocketConnection} from "@seerh5/socket";

export {Mock_KTool, Mock_SocketConnection};

let Mock_KTool = {
    getBitSetAsync: vi.fn(async (...values) => {
        return [true, true];
    }),
}

let Mock_SocketConnection: SocketConnection = {
    sendByQueue(
        cmd: number,
        data: (number | egret.ByteArray)[],
        resolver?: CallableFunction,
        rejecter?: CallableFunction
    ) {

    }
}