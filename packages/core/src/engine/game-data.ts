import { ConfigType } from '../constant';

type ConfigPredicate<T> = (value: T) => boolean;

const Iterator = <T>(type: T) => {
    let index = 0;
    let objectArray: Array<SAType.BaseObj>;
    switch (type) {
        case ConfigType.item:
            objectArray = Object.values(ItemXMLInfo._itemDict);
            break;
        case ConfigType.element:
            objectArray = Object.values(SkillXMLInfo.typeMap);
            break;
        case ConfigType.skill:
            objectArray = Object.values(SkillXMLInfo.SKILL_OBJ.Moves.Move);
            break;
        case ConfigType.pet:
            objectArray = Object.values(PetXMLInfo._dataMap);
            break;
        case ConfigType.suit:
            objectArray = SuitXMLInfo._dataMap.getValues();
            break;
        case ConfigType.title:
            objectArray = Object.values(AchieveXMLInfo.titleRules);
            break;
        case ConfigType.statusEffect:
            objectArray = PetStatusEffectConfig.xml.BattleEffect[0].SubEffect;
            break;
        default:
            throw new Error('不支持的查询集合');
    }
    return {
        next() {
            return { done: index >= objectArray.length, value: objectArray[index++] as T };
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

const getObjectId = (obj: SAType.BaseObj) => {
    return getObjProperty(obj, ['ID', 'id']) as number;
};

const getObjectName = (obj: SAType.BaseObj) => {
    return getObjProperty(obj, ['Name', 'name', 'cn', 'title', 'DefName']) as string;
};

export function find<T extends SAType.BaseObj>(type: T, predicate: ConfigPredicate<T>) {
    for (const obj of Iterator<T>(type)) {
        if (predicate(obj)) {
            return obj;
        }
    }
}

export function filter<T extends SAType.BaseObj>(type: T, predicate: ConfigPredicate<T>) {
    const r = [];
    for (const obj of Iterator<T>(type)) {
        if (predicate(obj)) {
            r.push(obj);
        }
    }
    return r;
}

export function get<T extends SAType.BaseObj>(type: T, id: number) {
    return find(type, (v) => getObjectId(v) === id);
}

export function findByName<T extends SAType.BaseObj>(type: T, name: string) {
    return find(type, (v) => getObjectName(v) === name);
}

export function filterByName<T extends SAType.BaseObj>(type: T, name: string | RegExp) {
    return filter(type, (v) => Boolean(getObjectName(v).match(name)));
}

export function getName<T extends SAType.BaseObj>(type: T, id: number) {
    const o = find(type, (v) => getObjectId(v) === id);
    return o && getObjectName(o);
}
