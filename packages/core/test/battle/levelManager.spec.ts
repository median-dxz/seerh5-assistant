import { levelManager, ILevelRunner, LevelAction, ILevelBattle, MoveStrategy } from '../../battle';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Mock_KTool, mockEngine, Mock_SocketConnection } from '../mock';
import { SEAPetStore, CaughtPet } from '../../pet-helper';
import { engine } from '../../internal';

vi.stubGlobal('KTool', Mock_KTool);
vi.stubGlobal('SocketConnection', Mock_SocketConnection);
mockEngine();
SEAPetStore.query = async (): Promise<CaughtPet> => {
    return new CaughtPet(undefined);
}

beforeEach(async () => {
    console.log(engine);
    console.log(SocketConnection);
    await levelManager.stop();
});

describe('levelManagerTest', () => {
    class NoBattleLevelRunner implements ILevelRunner<object> {
        actions!: Record<string, (this: ILevelRunner<object>) => Promise<void>>;
        data!: object;

        logger(): any {
        }

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

    class MyBattle implements ILevelBattle {
        beforeBattle(): Promise<void> {
            return Promise.resolve(undefined);
        }

        pets: number[] = [0, 1, 2, 3];
        strategy: MoveStrategy;

    }

    class BattleLevelRunner extends NoBattleLevelRunner {
        selectLevelBattle(): ILevelBattle {
            return new MyBattle();
        }
    }

    let simpleAction = {
        async a() {

        }
    };

    function simplyRun(action: Record<string, (this: ILevelRunner<object>) => Promise<void>> = simpleAction) {
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
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
    });

    test('levelManager should invoke all actions', async () => {
        let mockLock = vi.fn((async () => {
        }));
        levelManager.lock = mockLock();
        await levelManager.stop();
        expect(levelManager.getRunner()).toBe(null);
        expect(mockLock).toHaveBeenCalled();
    });

    test("stop should throw error threw by runner's action", async () => {
        let actionA = vi.fn(async () => {});
        let actionB = vi.fn(async () => {});
        let actionStop = vi.fn(async () => {});
        let actions: Record<string, (this: ILevelRunner<object>) => Promise<void>> = {
            "a": actionA,
            "b": actionB,
            [LevelAction.STOP]: actionStop
        };
        let noBattleLevelRunner = new NoBattleLevelRunner();
        let now = '';
        noBattleLevelRunner.next = function() {
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
        expect(actionA).toHaveBeenCalled();
        expect(actionB).toHaveBeenCalled();
        expect(actionStop).toHaveBeenCalled();
    });

    test('run no battle action should throw error', async () => {
        let noBattleLevelRunner = new NoBattleLevelRunner();
        let actionA = vi.fn(async () => {});
        let actionBattle = vi.fn(async () => {});
        let actionStop = vi.fn(async () => {});
        let actions: Record<string, (this: ILevelRunner<object>) => Promise<void>> = {
            "a": actionA,
            [LevelAction.BATTLE]: actionBattle,
            [LevelAction.STOP]: actionStop
        };
        let now = '';
        noBattleLevelRunner.next = function() {
            if (now == '') {
                now = 'a';
            } else if (now == 'a') {
                now = LevelAction.BATTLE;
            } else if (now == 'b') {
                now = LevelAction.STOP;
            } else {
                now = LevelAction.STOP;
            }
            return now;
        };
        noBattleLevelRunner.actions = actions;
        levelManager.run(noBattleLevelRunner);
        try {
            await levelManager.lock;
            expect.fail('run no battle action should throw error');
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

    test('run battle action should success', async () => {
        let battleLevelRunner = new BattleLevelRunner();
        let actionA = vi.fn(async () => {});
        let actionBattle = vi.fn(async () => {});
        let actionStop = vi.fn(async () => {});
        battleLevelRunner.selectLevelBattle = vi.fn(battleLevelRunner.selectLevelBattle);
        let actions: Record<string, (this: ILevelRunner<object>) => Promise<void>> = {
            'a': actionA,
            [LevelAction.BATTLE]: actionBattle,
            [LevelAction.STOP]: actionStop
        };
        let now = '';
        battleLevelRunner.next = function() {
            if (now == '') {
                now = 'a';
            } else if (now == 'a') {
                now = LevelAction.BATTLE;
            } else if (now == 'b') {
                now = LevelAction.STOP;
            } else {
                now = LevelAction.STOP;
            }
            return now;
        };
        battleLevelRunner.actions = actions;
        levelManager.run(battleLevelRunner);
        await levelManager.lock;
        expect(actionA).toHaveBeenCalled();
        expect(actionBattle).not.toHaveBeenCalled();
        expect(actionStop).toHaveBeenCalled();
        expect(battleLevelRunner.selectLevelBattle).toHaveBeenCalled();
    });
});