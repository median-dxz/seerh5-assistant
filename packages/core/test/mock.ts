import { vi } from 'vitest';
import { spet } from '../pet-helper';

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

export function mockPet() {
    vi.mock('../pet-helper/pet', () => {
        return {
            spet() {
                return {
                    async default() {

                    }
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
                takeover() {
                },
                resolveStrategy() {
                },
                clear() {
                }
            }
        };
    });
}

