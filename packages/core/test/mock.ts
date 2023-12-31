import {vi} from "vitest";
import type {SocketConnection} from "@seerh5/socket";
import {Pet} from "../entity";

export {Mock_KTool};

let Mock_KTool = {
    getBitSetAsync: vi.fn(async (...values) => {
        return [true, true];
    }),
}
export function mockSocket() {
    vi.mock("../../internal/socket.js", () => {
        return {
            sendByQueue: (cmd: number, data: Parameters<SocketConnection['sendByQueue']>[1] = []) => {
                return (async () => {
                })();
            }
        }
    });
}

export function mockEngine() {
    vi.mock("../../internal/index.js", () => {
        const engine = {
            cureAllPet: () => {
            },
            autoCureState: async () => {
            },
            toggleAutoCure: async () => {
            },
            switchBag: async (pets: number[] | Pet[]) => {
            }
        };
        return {engine};
    });
}