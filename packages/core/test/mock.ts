import { vi } from 'vitest';

export { Mock_KTool, Mock_SocketConnection };

const Mock_KTool = {
    getBitSetAsync: vi.fn(async (...values) => {
        return [true, true];
    }),
};

const Mock_SocketConnection = {
    sendByQueue(
        cmd: number,
        data: (number | egret.ByteArray)[],
        resolver?: CallableFunction,
        rejecter?: CallableFunction
    ) {
        resolver?.({ data: null });
    },
};
