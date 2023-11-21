import type { Pet, PetRoundInfo } from '../entity/index.js';
import type { ProxyPet } from '../pet-helper/PetDataManager.js';

export type HookDataMap = {
    module_openMainPanel: { module: string; panel: string };
    module_construct: { module: string; id?: number };
    module_destroy: string;
    module_loadScript: string;
    popview_open: string;
    popview_close: string;
    award_receive: { items?: Array<{ id: number; count: number }> };
    socket_send: { cmd: number; data: seerh5.SocketRequestData };
    socket_receive: { cmd: number; buffer: egret.ByteArray | undefined };
    petbag_update: [Pet[], Pet[]];
};

export type SocketResponseMap = {
    2505: readonly [PetRoundInfo, PetRoundInfo]; // NOTE_USE_SKILL
    2301: ProxyPet; // GET_PET_INFO
    2304: PetTakeOutInfo; // PET_RELEASE
    43706: readonly [ProxyPet[], ProxyPet[]]; // GET_PET_INFO_BY_ONCE
};

export type GameConfigMap = {
    item: seerh5.ItemObj;
    suit: seerh5.SuitObj;
    title: seerh5.TitleObj;
    element: seerh5.ElementObj;
    skill: seerh5.MoveObj;
    pet: seerh5.PetObj;
    statusEffect: seerh5.StatusEffectObj;
};

export type GameModuleMap = {
    [module: string]: BaseModule;
};

// const Iterator = <T extends keyof GameConfigMap>(type: T) => {
//     let index = 0;
//     let objectArray: Array<seerh5.BaseObj>;
//     switch (type) {
//         case 'item':
//             objectArray = Object.values(ItemXMLInfo._itemDict);
//             break;
//         case 'element':
//             objectArray = Object.values(SkillXMLInfo.typeMap);
//             break;
//         case 'skill':
//             objectArray = Object.values(SkillXMLInfo.SKILL_OBJ.Moves.Move);
//             break;
//         case 'pet':
//             objectArray = Object.values(PetXMLInfo._dataMap);
//             break;
//         case 'suit':
//             objectArray = SuitXMLInfo._dataMap.getValues();
//             break;
//         case 'title':
//             objectArray = Object.values(AchieveXMLInfo.titleRules);
//             break;
//         case 'statusEffect':
//             objectArray = PetStatusEffectConfig.xml.BattleEffect[0].SubEffect;
//             break;
//         default:
//             throw new Error('不支持的查询集合');
//     }
//     return {
//         next() {
//             return { done: index >= objectArray.length, value: objectArray[index++] as GameConfigMap[T] };
//         },
//         [Symbol.iterator]() {
//             return this;
//         },
//     };
// };

// const getObjProperty = (obj: seerh5.BaseObj, propertyTags: string[]) => {
//     for (const property of propertyTags) {
//         if (Object.hasOwn(obj, property)) {
//             return obj[property];
//         }
//     }
//     return undefined;
// };

// const getObjectId = (obj: seerh5.BaseObj) => getObjProperty(obj, ['SpeNameBonus', 'id', 'ID']) as number;

// const getObjectName = (obj: seerh5.BaseObj) =>
//     getObjProperty(obj, ['title', 'cn', 'name', 'DefName', 'Name']) as string;