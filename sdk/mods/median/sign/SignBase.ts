import { LevelAction, NOOP } from '@sea/core';
import type { LevelData } from '@sea/mod-type';

export const signBase = {
    next: () => LevelAction.AWARD,
    logger: NOOP
};

export const data: LevelData = {
    remainingTimes: 0,
    progress: 0,
    maxTimes: 0
};
