import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ILevelRunner, LevelAction, levelManager } from '../../battle';
import { Mock_KTool } from '../mock';

vi.stubGlobal('KTool', Mock_KTool);

beforeEach(() => {
    return levelManager.stop();
});

vi.mock('../../internal/index.js', () => {
    const engine = {
        cureAllPet: () => {},
        autoCureState: async () => {},
        toggleAutoCure: async () => {},
    };
    return { engine };
});

describe.sequential('levelManagerTest', () => {
    class NoBattleLevelRunner implements ILevelRunner<object> {
        actions: Record<string, () => Promise<void>>;
        data: object;

        logger = console.log;

        x = 1;

        next(): string {
            if (this.x > 0) {
                this.x = 0;
                console.log('first');
                return 'a';
            }
            console.log('stop');
            return LevelAction.STOP;
        }

        update(): Promise<void> {
            return Promise.resolve(undefined);
        }
    }

    let simpleAction = {
        a: async () => {},
    };

    function simplyRun(action: Record<string, () => Promise<void>> = simpleAction) {
        const myLevelRunner = new NoBattleLevelRunner();
        myLevelRunner.actions = action;
        levelManager.run(myLevelRunner);
        return myLevelRunner;
    }

    test('running without runner should return false', () => {
        expect(levelManager.running).toBe(false);
    });

    test('running with runner should return true', () => {
        simplyRun();
        expect(levelManager.running).toBe(true);
    });

    test('getRunner without runner should return null', () => {
        expect(levelManager.getRunner()).toBe(null);
    });

    test('getRunner with runner should return runner passed into run', () => {
        const myLevelRunner = simplyRun();
        expect(levelManager.getRunner()).toBe(myLevelRunner);
    });

    test('run when running should throw error', () => {
        const myLevelRunner = simplyRun();
        try {
            levelManager.run(myLevelRunner);
            expect.fail('run when running should throw error');
        } catch (e: unknown) {
            e instanceof Error && console.log(e.message);
        }
    });

    test('levelManager should invoke all actions', async () => {
        let shouldAwaitLock = vi.fn(async () => {});
        levelManager.lock = shouldAwaitLock();
        await levelManager.stop();
        expect(levelManager.getRunner()).toBe(null);
        expect(shouldAwaitLock).toHaveBeenCalled();
    });

    test("stop should throw error threw by runner's action", async () => {
        const actions = {
            a: vi.fn(async () => {}),
            b: vi.fn(async () => {}),
            [LevelAction.STOP]: vi.fn(async () => {}),
        };
        const noBattleLevelRunner = new NoBattleLevelRunner();
        let now = '';
        noBattleLevelRunner.next = function () {
            if (now == '') {
                now = 'a';
            } else if (now == 'a') {
                now = 'b';
            } else if (now == 'b') {
                now = LevelAction.STOP;
            } else {
                now = LevelAction.STOP;
            }
            return now;
        };
        noBattleLevelRunner.actions = actions;
        levelManager.run(noBattleLevelRunner);
        await levelManager.lock;
        expect(actions.a).toHaveBeenCalled();
        expect(actions.b).toHaveBeenCalled();
        expect(actions[LevelAction.STOP]).toHaveBeenCalled();
    });
});
