import type { PetFragmentLevelDifficulty as Difficulty, LevelBattle, PetFragmentLevel } from '@sea/core';

export interface PetFragmentOption {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    battle: LevelBattle[];
}

export type PetFragmentOptionRaw = Omit<PetFragmentOption, 'battle'> & { battle: string[] };

export interface IPetFragmentRunner {
    readonly designId: number;
    readonly frag: PetFragmentLevel;
    option: PetFragmentOption;
}
