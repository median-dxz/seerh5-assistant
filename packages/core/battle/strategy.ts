import type { Pet, Skill } from '../entity/index.js';
import type { RoundData } from './provider.js';

export type MoveHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type SwitchNoBloodHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type MoveStrategy = {
    resolveNoBlood: SwitchNoBloodHandler;
    resolveMove: MoveHandler;
};

export const matchSkillName = (skillNames: string[]) => (skills: Skill[]) => {
    const r = skills.find((skill) => skillNames.some((name) => skill.name === name && skill.pp > 0));
    return r?.id;
};

export const matchNoBloodChain = (petNames: string[]) => (pets: Pet[], dyingCt: number) => {
    const r = pets.find((pet) => pet.catchTime === dyingCt);
    if (!r) return -1;

    const checkName = petNames[petNames.indexOf(r.name) + 1];
    const index = pets.findIndex((pet) => pet.name === checkName && pet.hp > 0);

    return index ?? -1;
};
