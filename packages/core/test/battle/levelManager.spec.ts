import {levelManager, ILevelRunner, LevelAction, ILevelBattle} from "../../battle";
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Mock_KTool, mockSocket, mockEngine} from "../mock";


beforeEach(async () => {
    vi.stubGlobal("KTool", Mock_KTool);
    mockSocket();
    mockEngine();
    levelManager.lock = null;
    await levelManager.stop();
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
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
    });

    test("levelManager should invoke all actions", async () => {
        let mockLock = vi.fn((async () => {}));
        levelManager.lock = mockLock();
        await levelManager.stop();
        expect(levelManager.getRunner()).toBe(null);
        expect(mockLock).toHaveBeenCalled();
    });

    test("stop should throw error threw by runner's action", async () => {
        let actionA = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actionB = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actionStop = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actions: Record<string, (self: NoBattleLevelRunner) => Promise<void>> = {
            "a": actionA,
            "b": actionB,
            [LevelAction.STOP]: actionStop
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
        expect(actionA).toHaveBeenCalled();
        expect(actionB).toHaveBeenCalled();
        expect(actionStop).toHaveBeenCalled();
    });

    test("run no battle action should throw error", async () => {
        let noBattleLevelRunner = new NoBattleLevelRunner();
        let actionA = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actionBattle = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actionStop = vi.fn(async (self: NoBattleLevelRunner) => {});
        let actions: Record<string, (self: NoBattleLevelRunner) => Promise<void>> = {
            "a": actionA,
            [LevelAction.BATTLE]: actionBattle,
            [LevelAction.STOP]: actionStop
        };
        let now = "";
        noBattleLevelRunner.next = function () {
            if (now == "") {
                now = "a";
            } else if (now == "a") {
                now = LevelAction.BATTLE;
            } else if (now == "b") {
                now = LevelAction.STOP;
            } else {
                now = LevelAction.STOP;
            }
            return now;
        }
        noBattleLevelRunner.actions = actions;
        levelManager.run(noBattleLevelRunner);
        try {
            await levelManager.lock;
            expect.fail("run no battle action should throw error");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
        expect(actionA).toHaveBeenCalled();
        expect(actionBattle).not.toHaveBeenCalled();
        expect(actionStop).not.toHaveBeenCalled();
    });
});