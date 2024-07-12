import { Mock_KTool, Mock_SocketConnection, mockEngine, mockPet } from '../mock';

import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import type { LevelBattle, LevelRunner, MoveStrategy } from '../../battle';
import { LevelAction, levelManager } from '../../battle';
import { hookFn, restoreHookedFn } from '../../common/utils';
import type { Item } from '../../entity';
import type { CaughtPet, PetLocation } from '../../pet-helper';
import { SEAPetStore } from '../../pet-helper';

vi.stubGlobal('KTool', Mock_KTool);
vi.stubGlobal('SocketConnection', Mock_SocketConnection);
mockEngine();
mockPet();

beforeAll(() => {
    hookFn(SEAPetStore, 'query', async (): Promise<CaughtPet> => {
        const info: CaughtPet = {
            __type: undefined,
            baseCurHp: 0,
            baseMaxHp: 0,
            catchTime: 0,
            dv: 0,
            element: undefined,
            hasFifthSkill: false,
            hp: 0,
            id: 0,
            level: 0,
            maxHp: 0,
            name: '',
            nature: 0,
            skills: [],
            async cure(): Promise<CaughtPet> {
                return Promise.resolve(undefined);
            },
            default(): Promise<boolean> {
                return Promise.resolve(undefined);
            },
            get hasEffect(): boolean {
                return false;
            },
            get isDefault(): boolean {
                return false;
            },
            async location(): Promise<PetLocation> {
                return Promise.resolve(undefined);
            },
            async popFromBag(): Promise<void> {
                return Promise.resolve(undefined);
            },
            async setLocation(newLocation: PetLocation): Promise<boolean> {
                return Promise.resolve(undefined);
            },
            async useItem(item: Item | number): Promise<CaughtPet> {
                return Promise.resolve(undefined);
            },
            async usePotion(potion: Item | number): Promise<CaughtPet> {
                return Promise.resolve(undefined);
            }
        };
        return info;
    });
});

beforeEach(async () => {
    try {
        await levelManager.abort();
    } catch (e) {
        // 上个测试引发的错误，直接忽略
    }
});

afterAll(() => {
    restoreHookedFn(SEAPetStore, 'query');
});

describe.sequential('levelManagerTest', () => {
    class NoBattleLevelRunner implements LevelRunner {
        actions!: Record<string, (this: LevelRunner) => Promise<void>>;
        data!: object;

        logger(): any {}

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

    class MyBattle implements LevelBattle {
        async beforeBattle() {}

        pets: number[] = [0, 1, 2, 3];
        strategy: MoveStrategy;
    }

    class BattleLevelRunner extends NoBattleLevelRunner {
        selectLevelBattle(): LevelBattle {
            return new MyBattle();
        }
    }

    const simpleAction = {
        a: async () => {}
    };

    function simplyRun(action: Record<string, (this: LevelRunner) => Promise<void>> = simpleAction) {
        const myLevelRunner = new NoBattleLevelRunner();
        myLevelRunner.actions = action;
        levelManager.run(myLevelRunner);
        return myLevelRunner;
    }

    function setNextWithBattle(battleLevelRunner: LevelRunner) {
        let now = '';
        battleLevelRunner.next = function () {
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
        const mockLock = vi.fn(async () => {});
        levelManager.lock = mockLock();
        await levelManager.abort();
        expect(levelManager.getRunner()).toBe(null);
        expect(mockLock).toHaveBeenCalled();
    });

    test("stop should throw error by runner's action", async () => {
        const actions = {
            a: vi.fn(async () => {}),
            b: vi.fn(async () => {}),
            [LevelAction.STOP]: vi.fn(async () => {})
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
        expect(actions.stop).toHaveBeenCalled();
    });

    test('run no battle action should throw error', async () => {
        const noBattleLevelRunner = new NoBattleLevelRunner();
        const actionA = vi.fn(async () => {});
        const actionBattle = vi.fn(async () => {});
        const actionStop = vi.fn(async () => {});
        const actions: Record<string, (this: LevelRunner) => Promise<void>> = {
            a: actionA,
            [LevelAction.BATTLE]: actionBattle,
            [LevelAction.STOP]: actionStop
        };
        setNextWithBattle(noBattleLevelRunner);
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
        const battleLevelRunner = new BattleLevelRunner();
        const actionA = vi.fn(async () => {});
        const actionBattle = vi.fn(async () => {});
        const actionStop = vi.fn(async () => {});
        battleLevelRunner.selectLevelBattle = vi.fn(battleLevelRunner.selectLevelBattle);
        const actions: Record<string, (this: LevelRunner) => Promise<void>> = {
            a: actionA,
            [LevelAction.BATTLE]: actionBattle,
            [LevelAction.STOP]: actionStop
        };
        setNextWithBattle(battleLevelRunner);
        battleLevelRunner.actions = actions;
        levelManager.run(battleLevelRunner);
        await levelManager.lock;
        expect(actionA).toHaveBeenCalled();
        expect(actionBattle).not.toHaveBeenCalled();
        expect(actionStop).toHaveBeenCalled();
        expect(battleLevelRunner.selectLevelBattle).toHaveBeenCalled();
    });
});
