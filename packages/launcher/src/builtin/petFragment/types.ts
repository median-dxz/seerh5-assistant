import type { PetFragmentLevelDifficulty as Difficulty, PetFragmentLevel } from '@sea/core';
import type { LevelData, Task } from '@sea/mod-type';

export interface PetFragmentOptions {
    id: number;
    difficulty: 1 | 2 | 3;
    sweep: boolean;
    battle: string[];
}

export interface IPetFragmentRunner
    extends ReturnType<Task<undefined, PetFragmentLevelData, 'sweep' | 'battle' | 'stop'>['runner']> {
    readonly designId: number;
    readonly level: PetFragmentLevel;
    options: PetFragmentOptions;
}

export interface PetFragmentLevelData extends LevelData {
    piecesOwned: number;
    isChallenge: boolean;
    curDifficulty: Difficulty;
    failedTimes: number;
    curPosition: number;
    canSweep: boolean;
}
