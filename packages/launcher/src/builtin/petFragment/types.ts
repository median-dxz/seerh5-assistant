import type { PetFragmentLevelDifficulty as Difficulty, IPFLevelBoss, PetFragmentLevel } from '@sea/core';
import type { LevelData, LevelMeta, Task } from '@sea/mod-type';

export interface PetFragmentOption {
    id: number;
    difficulty: number;
    sweep: boolean;
    battle: string[];
}

export interface IPetFragmentRunner
    extends ReturnType<Task<LevelMeta, undefined, PetFragmentLevelData, 'sweep' | 'battle' | 'stop'>['runner']> {
    readonly designId: number;
    readonly frag: PetFragmentLevel;
    options: PetFragmentOption;
}

export interface PetFragmentLevelData extends LevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}
