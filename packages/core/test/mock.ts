import { vi } from 'vitest';

export const Mock_SocketConnection = {
    sendByQueue(
        cmd: number,
        data: Array<number | egret.ByteArray>,
        resolver?: CallableFunction,
        rejecter?: CallableFunction
    ) {
        resolver({ data: null });
    }
};

export function mockEngine() {
    vi.mock('../internal/index', () => {
        const engine = {
            cureAllPet: async () => {},
            autoCureState: async () => {},
            toggleAutoCure: async () => {},
            switchBag: async () => {}
        };
        return { engine };
    });
}

export function mockPet() {
    vi.mock('../pet-helper/pet', () => ({
        spet() {
            return {
                async default() {}
            };
        }
    }));
}

export function mockCore() {
    vi.mock('../battle/manager', () => ({
        context: {
            strategy: undefined,
            triggerLock: null,
            delayTimeout: null
        },
        manager: {
            takeover() {},
            resolveStrategy() {},
            clear() {}
        }
    }));
}
