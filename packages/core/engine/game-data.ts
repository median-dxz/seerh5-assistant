import type { GameDataType } from '../constant/index.js';

type PredicateFn<T> = (value: T) => boolean;

const Iterator = <T extends keyof GameDataType>(type: T) => {
    let index = 0;
    let objectArray: Array<SAType.BaseObj>;
    switch (type) {
        case 'item':
            objectArray = Object.values(ItemXMLInfo._itemDict);
            break;
        case 'element':
            objectArray = Object.values(SkillXMLInfo.typeMap);
            break;
        case 'skill':
            objectArray = Object.values(SkillXMLInfo.SKILL_OBJ.Moves.Move);
            break;
        case 'pet':
            objectArray = Object.values(PetXMLInfo._dataMap);
            break;
        case 'suit':
            objectArray = SuitXMLInfo._dataMap.getValues();
            break;
        case 'title':
            objectArray = Object.values(AchieveXMLInfo.titleRules);
            break;
        case 'statusEffect':
            objectArray = PetStatusEffectConfig.xml.BattleEffect[0].SubEffect;
            break;
        default:
            throw new Error('不支持的查询集合');
    }
    return {
        next() {
            return { done: index >= objectArray.length, value: objectArray[index++] as GameDataType[T] };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
};

const getObjProperty = (obj: SAType.BaseObj, propertyTags: string[]) => {
    for (const property of propertyTags) {
        if (Object.hasOwn(obj, property)) {
            return obj[property];
        }
    }
    return undefined;
};

const getObjectId = (obj: SAType.BaseObj) => getObjProperty(obj, ['SpeNameBonus', 'id', 'ID']) as number;

const getObjectName = (obj: SAType.BaseObj) => getObjProperty(obj, ['title', 'cn', 'name', 'DefName', 'Name']) as string;

export function find<T extends keyof GameDataType>(type: T, predicate: PredicateFn<GameDataType[T]>) {
    for (const obj of Iterator<T>(type)) {
        if (predicate(obj)) {
            return obj;
        }
    }
}

export function filter<T extends keyof GameDataType>(type: T, predicate: PredicateFn<GameDataType[T]>) {
    const r = [];
    for (const obj of Iterator<T>(type)) {
        if (predicate(obj)) {
            r.push(obj);
        }
    }
    return r;
}

export function get<T extends keyof GameDataType>(type: T, id: number) {
    return find(type, (v) => getObjectId(v) === id);
}

export function findByName<T extends keyof GameDataType>(type: T, name: string) {
    return find(type, (v) => getObjectName(v) === name);
}

export function filterByName<T extends keyof GameDataType>(type: T, name: string | RegExp) {
    return filter(type, (v) => Boolean(getObjectName(v).match(name)));
}

export function getName<T extends keyof GameDataType>(type: T, id: number) {
    const o = find(type, (v) => getObjectId(v) === id);
    return o && getObjectName(o);
}
