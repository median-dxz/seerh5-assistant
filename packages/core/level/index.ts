import { Manager } from '../battle/index.js';
import { delay } from '../common/utils.js';
import { Engine } from '../engine/index.js';
import { SEAPet } from '../pet-helper/index.js';
import type { ILevelRunner } from './type.js';
import { LevelAction } from './type.js';

export * from './type.js';

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
            Manager.clear();
        }
    }

    run(runner: ILevelRunner) {
        if (this.running) throw new Error('你必须先停止当前关卡的运行!');

        this.runner = runner;
        const { logger, beforeAll, afterAll } = runner;

        const lockFn = async () => {
            logger('预处理');
            await beforeAll?.();

            const battle = async () => {
                const { strategy, pets, beforeBattle } = runner.selectBattle();

                logger('切换背包');
                await Engine.switchBag(pets);

                const autoCureState = await Engine.autoCureState();
                Engine.toggleAutoCure(false);
                Engine.cureAllPet();

                await delay(100);

                logger('执行战斗前预处理');
                await beforeBattle?.();
                await SEAPet(pets[0]).default();

                logger('进入战斗');
                try {
                    if (!this.runner) throw '关卡已停止运行';

                    await Manager.takeover(() => {
                        runner.actions['battle'].call(runner);
                    }, strategy);

                    logger('战斗完成');
                } catch (error) {
                    this.runner = null;
                    logger(`战斗进入错误: ${error as string}`);
                }

                // 恢复自动治疗状态
                await Engine.toggleAutoCure(autoCureState);
                Manager.clear();
            };

            while (this.runner) {
                logger('更新关卡信息');
                const nextAction = await runner.update();
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
            await afterAll?.();

            logger('关卡完成');
            this.lock = this.runner = null;
        };

        this.lock = lockFn();
    }
}
