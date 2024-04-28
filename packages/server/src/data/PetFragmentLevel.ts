import { SEASConfigData } from '../utils/SEASConfigData.ts';

export interface PetFragmentLevelConfigType {
    name: string;
    sweep: boolean;
    id: number;
    battle: string[];
    difficulty: number;
}

class PetFragmentLevel extends SEASConfigData<Array<PetFragmentLevelConfigType>> {
    constructor() {
        super();
    }
    async loadWithDefault(configFile: string) {
        return super.loadWithDefault(configFile, []);
    }
}

export const petFragmentLevel = new PetFragmentLevel();
