import { Manager } from '../battle/index.js';
import { delay } from '../common/utils.js';
import { toggleAutoCure } from '../engine/index.js';
import { switchBag } from '../functions/index.js';
import { SAPet, cureAllPet } from '../pet-helper/index.js';
import type { ILevelRunner } from './type.js';
import { SALevelState } from './type.js';

export * from './type.js';

export class SALevelManager {
    // 单例模式
    private static _instance: SALevelManager;
    public static get ins() {
        return this._instance || (this._instance = new SALevelManager());
    }
    private constructor() {
        // constructor
    }

    runner: ILevelRunner | null = null;
    locker: Promise<boolean> | null;

    get running() {
        return this.runner !== null;
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
            console.log(`关卡运行失败: ${e as string}`);
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
            while (this.runner) {
                logger('更新关卡信息');
                const state = await runner.updater();
                switch (state) {
                    case SALevelState.BATTLE:
                        {
                            const { strategy: moveModule, pets, beforeBattle } = runner.selectStrategy();

                            logger('切换背包');
                            await switchBag(pets);

                            toggleAutoCure(false);
                            cureAllPet();

                            await delay(100);

                            logger('执行战斗前预处理');
                            await beforeBattle?.();
                            await SAPet.default(pets[0]);

                            logger('进入战斗');
                            try {
                                await Manager.runOnce(() => {
                                    runner.actions['battle'].call(runner);
                                }, moveModule);
                            } catch (error) {
                                this.runner = null;
                                logger(`战斗进入错误: ${error as string}`);
                                break;
                            }

                            await toggleAutoCure(true);
                            Manager.clear();
                            logger('战斗完成');
                        }
                        break;
                    case SALevelState.STOP:
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