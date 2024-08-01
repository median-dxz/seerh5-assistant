import { levelManager } from '@sea/core';

import type { AppRootState } from '@/store';

export const abortLevelManager = async () =>
    levelManager.abort().catch((e: unknown) => {
        // TODO 超时处理 | 强制结束战斗处理 | 正常终止
        if (e instanceof Error) {
            console.error(`停止关卡失败: ${e.message}`);
        } else {
            console.error(`停止关卡失败: ${JSON.stringify(e)}`);
        }
    });

export const shouldRunTask = (state: AppRootState) => {
    const {
        taskScheduler: { isPaused: isPaused, status, currentIndex }
    } = state;

    if (isPaused || currentIndex == undefined || status !== 'idle') {
        return false;
    }

    if (levelManager.running) {
        console.error(
            [
                `关卡调度器: tryStartNextRunner: 不合理的State: ${JSON.stringify(state)}`,
                'LevelManger的上一次运行未释放'
            ].join('\n')
        );
        return false;
    }
    return true;
};
