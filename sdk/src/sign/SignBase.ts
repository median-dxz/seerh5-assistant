import { LevelAction, NOOP } from '@sea/core';
import type { LevelData, LevelMeta } from '@sea/launcher';

export class SignBase {
    get meta() {
        return {} as LevelMeta;
    }

    get name() {
        return this.meta.name;
    }

    data: LevelData = {
        progress: 0,
        remainingTimes: 0,
    };

    next() {
        return LevelAction.AWARD;
    }
    logger = NOOP;
}
