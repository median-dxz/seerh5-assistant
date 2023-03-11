let DictMatcher = <T extends SAType.BaseObj>(dict: SAType.Dict<T>, reg: RegExp, keyName: string) => {
    return Object.values(dict).filter(
        (value) => Object.hasOwn(value, keyName) && (value[keyName] as string).match(reg)
    );
};

export function matchItemName(nameReg: RegExp) {
    return DictMatcher(ItemXMLInfo._itemDict, nameReg, 'Name');
}

export function matchSkillName(nameReg: RegExp) {
    return DictMatcher(SkillXMLInfo.movesMap, nameReg, 'Name');
}

export function matchPetName(nameReg: RegExp) {
    return DictMatcher(PetXMLInfo._dataMap, nameReg, 'DefName');
}

export async function getStatusName(id: any) {
    return PetStatusEffectConfig.getName(0, id);
}

export function getElement(id: number) {
    return SkillXMLInfo.typeMap[PetXMLInfo.getType(id)];
}

export function getElementByName(name: string) {
    return Object.values(SkillXMLInfo.typeMap).find((v) => v.cn.match(name));
}