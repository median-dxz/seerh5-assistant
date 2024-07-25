import type { PetFragmentLevelDifficulty as Difficulty, IPFLevelBoss, PetFragmentLevel } from '@sea/core';
import type { LevelData, Task } from '@sea/mod-type';

export interface PetFragmentOptions {
    id: number;
    difficulty: Difficulty;
    battle: string[];
}

export interface IPetFragmentRunner
    extends ReturnType<Task<undefined, PetFragmentLevelData, 'sweep' | 'battle' | 'stop'>['runner']> {
    readonly designId: number;
    readonly frag: PetFragmentLevel;
    options: PetFragmentOptions & { sweep: boolean };
}

export interface PetFragmentLevelData extends LevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}
