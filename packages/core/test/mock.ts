import { vi } from 'vitest';

export const Mock_KTool = {
    getBitSetAsync: vi.fn(async () => {
        return [true, true];
    })
};

export const Mock_SocketConnection = {
    sendByQueue(
        cmd: number,
        data: (number | egret.ByteArray)[],
        resolver?: CallableFunction,
        rejecter?: CallableFunction
    ) {
        resolver?.({ data: null });
    }
};

export function mockEngine() {
    vi.mock('../internal/index', () => {
        const engine = {
            cureAllPet: () => {},
            autoCureState: async () => {},
            toggleAutoCure: async () => {},
            switchBag: async () => {}
        };
        return { engine };
    });
}

export function mockPet() {
    vi.mock('../pet-helper/pet', () => {
        return {
            spet() {
                return {
                    async default() {}
                };
            }
        };
    });
}

export function mockCore() {
    vi.mock('../battle/manager', () => {
        return {
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
        };
    });
}
