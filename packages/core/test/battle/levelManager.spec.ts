import {levelManager, ILevelRunner, LevelAction} from "../../battle";
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Mock_KTool, Mock_SocketConnection} from "../mock";

beforeEach(() => {
    vi.stubGlobal("KTool", Mock_KTool);
    vi.stubGlobal("SocketConnection", Mock_SocketConnection);
    levelManager.stop().then();
});

describe("levelManagerTest", () => {
    class NoBattleLevelRunner implements ILevelRunner<object> {
        actions: Record<string, (self: NoBattleLevelRunner) => Promise<void>>;
        data: object;

        logger(args: any): any {
        }

        x = 1;

        next(): string {
            if (this.x > 0) {
                this.x = 0;
                console.log("first");
                return "a";
            }
            console.log("stop");
            return LevelAction.STOP;
        }

        update(): Promise<void> {
            return Promise.resolve(undefined);
        }

    }

    let simpleAction = {
        "a": async (self: NoBattleLevelRunner) => {

        }
    };

    function simplyRun(action: Record<string, (self: NoBattleLevelRunner) => Promise<void>> = simpleAction) {
        const myLevelRunner = new NoBattleLevelRunner();
        myLevelRunner.actions = action
        levelManager.run(myLevelRunner);
        return myLevelRunner;
    }

    test("running without runner should return false", () => {
        expect(levelManager.running).toBe(false);
    });

    test("running with runner should return true", () => {
        simplyRun();
        expect(levelManager.running).toBe(true);
    });

    test("getRunner without runner should return null", () => {
        expect(levelManager.getRunner()).toBe(null);
    });

    test("getRunner with runner should return runner passed into run", () => {
        const myLevelRunner = simplyRun();
        expect(levelManager.getRunner()).toBe(myLevelRunner);
    });

    test("run when running should throw error", () => {
        const myLevelRunner = simplyRun();
        try {
            levelManager.run(myLevelRunner);
            expect.fail("run when running should throw error");
        } catch (e: Error) {
            console.log(e.message);
        }
    });

    test("levelManager should invoke all actions", async () => {
        simplyRun();
        let shouldAwaitLock = false;
        levelManager.lock = (async () => {
            shouldAwaitLock = true;
        })();
        await levelManager.stop();
        expect(levelManager.getRunner()).toBe(null);
        expect(shouldAwaitLock).toBe(true, "stop should await lock");
    });

    test("stop should throw error threw by runner's action", async () => {
        let actionAInvoked = false;
        let actionBInvoked = false;
        let actionStopInvoked = false;
        let actions: Record<string, (self: NoBattleLevelRunner) => Promise<void>> = {
            "a": async (self: NoBattleLevelRunner) => {
                actionAInvoked = true;
            },
            "b": async (self: NoBattleLevelRunner) => {
                actionBInvoked = true;
            },
            [LevelAction.STOP]: async (self: NoBattleLevelRunner) => {
                actionStopInvoked = true;
            }
        };
        let noBattleLevelRunner = new NoBattleLevelRunner();
        let now = "";
        noBattleLevelRunner.next = function () {
            if (now == "") {
                now = "a";
            } else if (now == "a") {
                now = "b";
            } else if (now == "b") {
                now = LevelAction.STOP;
            } else {
                now = LevelAction.STOP;
            }
            return now;
        }
        noBattleLevelRunner.actions = actions;
        levelManager.run(noBattleLevelRunner);
        await levelManager.lock;
        expect(actionAInvoked).toBe(true);
        expect(actionBInvoked).toBe(true);
        expect(actionStopInvoked).toBe(true);
    });
});