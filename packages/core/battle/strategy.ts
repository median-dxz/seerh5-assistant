import { SkillType } from '../constant/index.js';
import type { Pet, PetRoundInfo, Skill } from '../entity/index.js';
import { executor } from './executor.js';
import { context } from './manager.js';
import type { RoundData } from './provider.js';

export type MoveHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export interface MoveStrategy {
    resolveNoBlood: MoveHandler;
    resolveMove: MoveHandler;
}

export type Matcher = (...args: Parameters<MoveHandler>) => number | undefined;

function match(state: RoundData, skills: Skill[], pets: Pet[]) {
    return (...args: Matcher[]) => group(...args)(state, skills, pets);
}

// skill matchers
function rotating(...skills: string[]): Matcher {
    let count = 0;
    const { rotatingCount } = context;
    const stringifySkills = skills.join(',');

    if (rotatingCount.has(stringifySkills)) {
        count = rotatingCount.get(stringifySkills)!;
    }
    rotatingCount.set(stringifySkills, count + 1);

    return (_, allSkills) => {
        const availableSkills = skills
            .map((skillName) => allSkills.find((s) => s.name === skillName && s.pp > 0)?.id)
            .filter(Boolean);
        return availableSkills[count % availableSkills.length];
    };
}

function group(...operators: Matcher[]): Matcher {
    return (...states): number | undefined =>
        operators.reduce<undefined | number>((r, op) => {
            if (r) return r;
            return op(...states);
        }, undefined);
}

function name(...skills: string[]): Matcher {
    return (_, allSkills) => allSkills.find((skill) => skill.pp > 0 && skills.some((name) => skill.name === name))?.id;
}

function round(predicate: (round: number) => boolean, ...operators: Matcher[]): Matcher {
    return (state, ...rest) => {
        if (predicate(state.round)) return group(...operators)(state, ...rest);
        return undefined;
    };
}

function fifth(): Matcher {
    return (_, skill) => skill.find((skill) => skill.pp > 0 && skill.isFifth)?.id;
}

function attack(): Matcher {
    return (_, skill) => skill.find((skill) => skill.pp > 0 && skill.category !== SkillType.属性攻击)?.id;
}

function pet(predicate: (pet: PetRoundInfo) => boolean, ...operators: Matcher[]): Matcher {
    return (state, ...rest) => {
        if (predicate(state.self)) return group(...operators)(state, ...rest);
        return undefined;
    };
}

// pet matchers
function linkList(...pets: string[]): Matcher {
    return ({ self: { catchtime } }, _2, allPets) => {
        const r = allPets.find((pet) => pet.catchTime === catchtime);
        if (!r) return -1;

        const checkName = pets[pets.indexOf(r.name) + 1];
        return allPets.findIndex((pet) => pet.name === checkName && pet.hp > 0);
    };
}

// helper functions
function resetCount(...skills: string[]) {
    const { rotatingCount } = context;
    const stringifySkills = skills.join(',');
    if (rotatingCount.has(stringifySkills)) {
        rotatingCount.delete(stringifySkills);
    }
}

export { attack, fifth, group, linkList, match, name, pet, resetCount, rotating, round };

export const auto = {
    move(skills?: string[]): MoveHandler {
        return async (state, allSkills, pets) => {
            let r;
            if (skills) {
                r = await executor.useSkill(match(state, allSkills, pets)(name(...skills)));
            }
            !r && executor.auto();
            return Promise.resolve(true);
        };
    },
    noBlood(petList?: string[]): MoveHandler {
        return async (state, allSkills, pets) => {
            let r;
            if (petList) {
                r = await executor.switchPet(match(state, allSkills, pets)(linkList(...petList)));
            }
            !r && executor.auto();
            return Promise.resolve(true);
        };
    }
};
