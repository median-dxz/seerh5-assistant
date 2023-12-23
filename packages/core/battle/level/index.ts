import { delay } from '../../common/utils.js';
import { engine } from '../../internal/index.js';
import { spet } from '../../pet-helper/index.js';
import { manager } from '../manager.js';
import { LevelAction } from './action.js';
import type { ILevelRunner } from './type.js';

export class LevelManager {
    // 单例模式
    private static _instance: LevelManager;
    public static get ins() {
        return LevelManager._instance || (LevelManager._instance = new LevelManager());
    }
    private constructor() {
        // constructor
    }

    private runner: ILevelRunner | null = null;
    lock: Promise<void> | null = null;

    get running() {
        return this.runner != null;
    }

    /** 获取当前正在运行的Runner */
    getRunner(): ILevelRunner | null {
        return this.runner;
    }

    async stop() {
        if (!this.runner) return;
        this.runner = null;
        try {
            await this.lock;
        } catch (e) {
            throw `关卡运行失败: ${e as string}`;
        } finally {
            this.lock = null;
            manager.clear();
        }
    }

    run(runner: ILevelRunner) {
        if (this.running) throw new Error('你必须先停止当前Runner的运行!');

        this.runner = runner;
        const { logger, beforeAll, afterAll } = runner;

        const lockFn = async () => {
            logger('预处理');
            await beforeAll?.();
            const autoCureState = await engine.autoCureState();

            const battle = async () => {
                const { strategy, pets, beforeBattle } = runner.selectLevelBattle();

                logger('准备对战');
                await engine.switchBag(pets);

                engine.toggleAutoCure(false);
                engine.cureAllPet();

                await delay(100);

                logger('执行beforeBattle');
                await beforeBattle?.();
                await spet(pets[0]).default();

                logger('进入对战');
                try {
                    if (!this.runner) throw '关卡已停止运行';

                    await manager.takeover(() => {
                        runner.actions['battle'].call(runner);
                    }, strategy);

                    logger('对战完成');
                } catch (error) {
                    this.runner = null;
                    logger(`接管对战失败: ${error as string}`);
                }

                manager.clear();
            };

            while (this.runner) {
                logger('更新关卡信息');
                const nextAction = await runner.update();
                logger(`next action: ${nextAction}`);
                switch (nextAction) {
                    case LevelAction.BATTLE:
                        await battle();
                        break;
                    case LevelAction.STOP:
                        this.runner = null;
                        break;
                    default:
                        await runner.actions[nextAction].call(runner);
                        break;
                }
                await delay(100);
                if (!this.runner) break;
            }
            logger('正在停止关卡');
            // 恢复自动治疗状态
            await engine.toggleAutoCure(autoCureState);
            // TODO
            engine.cureAllPet();
            await afterAll?.();

            logger('关卡完成');
            this.lock = this.runner = null;
        };

        this.lock = lockFn();
    }
}
