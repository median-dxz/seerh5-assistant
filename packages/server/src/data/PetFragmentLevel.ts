import { SEASDatabase } from './db.ts';

export interface PetFragmentLevelConfigType {
    name: string;
    sweep: boolean;
    id: number;
    battle: string[];
    difficulty: number;
}

class PetFragmentLevel extends SEASDatabase<Array<PetFragmentLevelConfigType>> {
    constructor() {
        super([]);
    }
}

export const petFragmentLevel = new PetFragmentLevel();
