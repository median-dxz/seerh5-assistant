import type { Pet, Skill } from '../entity/index.js';
import { operator } from './operator.js';
import type { RoundData } from './provider.js';

export type MoveHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type SwitchNoBloodHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type MoveStrategy = {
    resolveNoBlood: SwitchNoBloodHandler;
    resolveMove: MoveHandler;
};

export const matchSkillName = (skillName: string[] | string) => (skills: Skill[]) => {
    const skillNames = Array.isArray(skillName) ? skillName : [skillName];
    const r = skills.find((skill) => skillNames.some((name) => skill.name === name && skill.pp > 0));
    return r?.id;
};

export const matchRotatingSkills = (skillNames: string[]) => (skills: Skill[], round: number) => {
    const availableSkills = skills.filter((skill) => skill.pp > 0 && skillNames.some((name) => skill.name === name));
    const r = availableSkills[round % availableSkills.length];
    return r?.id;
};

export const matchNoBloodChain = (petNames: string[]) => (pets: Pet[], dyingCt: number) => {
    const r = pets.find((pet) => pet.catchTime === dyingCt);
    if (!r) return -1;

    const checkName = petNames[petNames.indexOf(r.name) + 1];
    const index = pets.findIndex((pet) => pet.name === checkName && pet.hp > 0);

    return index ?? -1;
};

export function generateByName(skillNames: string[], petNames: string[]) {
    const dyl = matchNoBloodChain(petNames);
    const skn = matchSkillName(skillNames);
    return {
        async resolveNoBlood(state, _, pets) {
            const r = await operator.switchPet(dyl(pets, state.self.catchtime));
            if (!r) operator.auto();
            return true;
        },
        async resolveMove(_state, skills, _pets) {
            const r = await operator.useSkill(skn(skills));
            if (!r) operator.auto();
            return true;
        },
    } as MoveStrategy;
}

export const auto: MoveStrategy = {
    async resolveNoBlood() {
        operator.auto();
        return Promise.resolve(true);
    },
    async resolveMove() {
        operator.auto();
        return Promise.resolve(true);
    },
};
