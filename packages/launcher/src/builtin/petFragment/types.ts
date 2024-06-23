import type { PetFragmentLevelDifficulty as Difficulty, ILevelBattle, PetFragmentLevel } from '@sea/core';

export interface PetFragmentOption {
    id: number;
    difficulty: Difficulty;
    sweep: boolean;
    battle: ILevelBattle[];
}

export type PetFragmentOptionRaw = Omit<PetFragmentOption, 'battle'> & { battle: string[] };

export interface IPetFragmentRunner {
    readonly designId: number;
    readonly frag: PetFragmentLevel;
    option: PetFragmentOption;
}
