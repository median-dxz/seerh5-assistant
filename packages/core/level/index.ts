import { Manager } from '../battle/index.js';
import { delay } from '../common/utils.js';
import { Engine } from '../engine/index.js';
import { SEAPet } from '../pet-helper/index.js';
import type { ILevelRunner } from './type.js';
import { LevelState } from './type.js';

export * from './type.js';

export class LevelManager {
    // 单例模式
    private static _instance: LevelManager;
    public static get ins() {
        return this._instance || (this._instance = new LevelManager());
    }
    private constructor() {
        // constructor
    }

    runner: ILevelRunner | null = null;
    locker: Promise<boolean> | null = null;

    get running() {
        return this.runner != null;
    }

    getRunner<TRunner extends ILevelRunner>(): TRunner | null {
        return this.runner as TRunner;
    }

    async stop() {
        if (!this.runner) return;
        this.runner = null;
        try {
            await this.locker;
        } catch (e) {
            throw `关卡运行失败: ${e as string}`;
        }
        this.locker = null;
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

                Engine.toggleAutoCure(false);
                Engine.cureAllPet();

                await delay(100);

                logger('执行战斗前预处理');
                await beforeBattle?.();
                await SEAPet.default(pets[0]);

                logger('进入战斗');
                try {
                    if (!this.runner) throw '关卡已停止运行';

                    await Manager.takeover(() => {
                        runner.actions['battle'].call(runner);
                    }, strategy);
                } catch (error) {
                    this.runner = null;
                    logger(`战斗进入错误: ${error as string}`);
                    return;
                }

                await Engine.toggleAutoCure(true);
                Manager.clear();
                logger('战斗完成');
            };

            while (this.runner) {
                logger('更新关卡信息');
                const state = await runner.updater();
                switch (state) {
                    case LevelState.BATTLE:
                        await battle();
                        break;
                    case LevelState.STOP:
                        this.runner = null;
                        break;
                    default:
                        await runner.actions[state].call(runner);
                        break;
                }
                await delay(100);
                if (!this.runner) break;
            }
            logger('正在停止关卡');
            await afterAll?.();

            logger('关卡结束');
            return runner.data.success;
        };

        this.locker = lockFn();
        this.locker.then((result) => {
            logger(`关卡完成状态: ${result}`);
            this.locker = this.runner = null;
        });
    }
}
