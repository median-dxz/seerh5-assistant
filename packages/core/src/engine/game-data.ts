type DataPredicate<T> = (value: T) => boolean;

const match = <T extends SAType.BaseObj>(dict: SAType.Dict<T>, predicate: DataPredicate<T>) => {
    return Object.values(dict).filter(predicate);
};

const find = <T extends SAType.BaseObj>(dict: SAType.Dict<T>, predicate: DataPredicate<T>) => {
    return Object.values(dict).find(predicate);
};

export function getItem(id: number) {
    return ItemXMLInfo.getItemObj(id);
}

export function findItem(predicate: DataPredicate<SAType.ItemObj>) {
    return find(ItemXMLInfo._itemDict, predicate);
}

export function matchItem(predicate: DataPredicate<SAType.ItemObj>) {
    return match(ItemXMLInfo._itemDict, predicate);
}

export function matchItemByName(nameReg: RegExp) {
    return matchItem((item) => Boolean(item.Name.match(nameReg)));
}

export function getElement(id: number) {
    return SkillXMLInfo.typeMap[id] ? SkillXMLInfo.typeMap[id] : undefined;
}

export function findElement(predicate: DataPredicate<SAType.ElementObj>) {
    return find(SkillXMLInfo.typeMap, predicate);
}

export function matchElement(predicate: DataPredicate<SAType.ElementObj>) {
    return match(SkillXMLInfo.typeMap, predicate);
}

export function findElementByName(name: string) {
    return findElement((el) => el.cn === name);
}

export function getSkill(id: number) {
    return SkillXMLInfo.getSkillObj(id);
}

export function findSkill(predicate: DataPredicate<SAType.MoveObj>) {
    return find(SkillXMLInfo.SKILL_OBJ.Moves.Move, predicate);
}

export function matchSkill(predicate: DataPredicate<SAType.MoveObj>) {
    return match(SkillXMLInfo.SKILL_OBJ.Moves.Move, predicate);
}

export function findSkillByName(name: string) {
    return findSkill((skill) => skill.Name === name);
}

export function getPet(id: number) {
    return find(PetXMLInfo._dataMap, (pet) => pet.ID === id);
}

export function findPet(predicate: DataPredicate<SAType.PetObj>) {
    return find(PetXMLInfo._dataMap, predicate);
}

export function matchPet(predicate: DataPredicate<SAType.PetObj>) {
    return match(PetXMLInfo._dataMap, predicate);
}

export function findPetByName(name: string) {
    return findPet((pet) => pet.DefName === name);
}

export function getStatusName(id: number) {
    return PetStatusEffectConfig.getName(0, id);
}

export function getSuitName(id: number) {
    // return PetStatusEffectConfig.getName(0, id);
    // TODO
}

export function getTitleName(id: number) {
    // return PetStatusEffectConfig.getName(0, id);
    // TODO
}

// getTitleIdByName
// getSuitIdByName