import { vi } from 'vitest';

export let Mock_KTool = {
    getBitSetAsync: vi.fn(async () => {
        return [true, true];
    })
};

export let Mock_SocketConnection = {
    sendByQueue: async () => {
    }
};

export function mockEngine() {
    vi.mock('../internal/index', () => {
        const engine = {
            cureAllPet: () => {
            },
            autoCureState: async () => {
            },
            toggleAutoCure: async () => {
            },
            switchBag: async () => {
            }
        };
        return { engine };
    });
}