import { LevelAction } from '@sea/core';
import type { LevelData } from '@sea/mod-type';

export const signBase = {
    next(this: { data: LevelData }) {
        if (this.data.remainingTimes === 0) {
            return LevelAction.STOP;
        }
        return LevelAction.AWARD;
    }
};

export const data: LevelData = {
    remainingTimes: 0,
    progress: 0,
    maxTimes: 0
};
