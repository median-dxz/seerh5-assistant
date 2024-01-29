import { SkillType } from '../constant/index.js';
import type { Pet, PetRoundInfo, Skill } from '../entity/index.js';
import { executor } from './executor.js';
import type { RoundData } from './provider.js';

export type MoveHandler = (battleState: RoundData, skills: Skill[], pets: Pet[]) => Promise<boolean>;
export type MoveStrategy = {
    resolveNoBlood: MoveHandler;
    resolveMove: MoveHandler;
};

export type Matcher = (...args: Parameters<MoveHandler>) => number | undefined;

function match(state: RoundData, skills: Skill[], pets: Pet[]) {
    return (...args: Matcher[]) => group(...args)(state, skills, pets);
}

// skill matchers
function rotating(...skills: string[]): Matcher {
    return (state, allSkills) => {
        const availableSkills = allSkills.filter((skill) => skill.pp > 0 && skills.some((name) => skill.name === name));
        return availableSkills[state.round % availableSkills.length]?.id;
    };
}

function group(...operators: Matcher[]): Matcher {
    return (...states): number | undefined =>
        operators.reduce(
            (r, op) => {
                if (r) return r;
                return op(...states);
            },
            undefined as undefined | number
        );
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
        const index = allPets.findIndex((pet) => pet.name === checkName && pet.hp > 0);

        return index ?? -1;
    };
}

export { attack, fifth, group, linkList, match, name, pet, rotating, round };

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
