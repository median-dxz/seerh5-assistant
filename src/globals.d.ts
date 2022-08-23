interface Window {
    SA: any;
    SAEventManager: EventTarget;
}

declare var delay: (msec: number) => Promise<void>;
declare var warpper: (fn: () => any, before: () => any, after: () => any) => () => any;
declare var AwardItemDialog: any;
declare var PetUpdatePropController: any;
declare var EventManager: any;

declare var OnlineManager: any;
declare var hideSerialID: (() => void) | undefined;

declare var egret: any;
declare var RES: any;

declare module ModuleManager {
    export var beginShow: any;
    export var _openModelCompete: any;
    export var loadScript: any;
    export var appJs: Object;
    export var currModule: any;
}

declare module PetFightController { export var roundTimes: number }
declare module AwardManager { }


declare var Alarm: any;
declare var BubblerManager: any;
declare var FighterModelFactory: any;
declare var FightManager: any;
declare var FightUserInfo: any;
declare var LoginService: any;
declare var LevelManager: any;
declare var CountermarkController: any;

declare namespace SA {
    //     module "Const"
    //     module "Utils"
    //     module "PetHelper"
    //     module "Functions"
    //     module "BattleModule"
    //     module "PetFactor"
}

declare var CommandID: any;

interface SocketConnection {
    removeCmdListener(v: any): unknown;
    sendByQueue(cmd: number, data: any[], arg2: (v: any) => void, arg3: (err: any) => void): unknown;
    addCmdListener(cmdId: string | number, callback: (data: any) => void): void
}

declare var SocketConnection: SocketConnection;

interface PetManager {
    noAlarmCureAll(): unknown;
    updateBagInfo(callback: () => void): unknown;
    addLovePet(arg0: number, ct: any, arg2: number): unknown;
    delLovePet(arg0: number, ct: any, arg2: number): unknown;
    secondBagToStorage(ct: any): unknown;
    bagToStorage(ct: any): unknown;
    loveToBag(ct: any): unknown;
    storageToBag(ct: any): unknown;
    secondBagToBag(ct: any): unknown;
    storageToSecondBag(ct: any): unknown;
    bagToSecondBag(ct: any): unknown;
    isBagFull: any;
    getLovePetList(): unknown;
    isSecondBagFull: any;
    defaultTime: number,
    _bagMap: any,
    _secondBagMap: any,
    getPetInfo: (catchTime: number) => PetLike,
    setDefault: (catchTime: number) => void
}

declare var PetManager: PetManager;

interface PetLike {
    [x: string]: any;
    name: string,
    catchTime: number,
    id?: number
}

interface PetStorageInfoManager {
    changePetPosi(ct: any, elite: number): unknown;
    getInfoByType: (a: number, b: number) => object,
    getTotalInfo: (callback: () => void) => void,
    allInfo: PetLike[]
}

declare var PetStorage2015InfoManager: PetStorageInfoManager;

interface SkillXMLInfo {
    getCategoryName: (ctg: number) => string,
    getName: (id: number) => string,
    getSkillObj: (id: number) => object,
    getTypeID: (pid: number) => number,
    SKILL_OBJ: object,
    typeMap: Map<number, object>
}

declare var SkillXMLInfo: SkillXMLInfo;

declare var TypeXMLInfo: any;
//  = {
//     getRelationsPow: (e1: number, e2: number) => number
// }

declare var PetXMLInfo: any;
//  = {
//     getType: (id: number) => number,
// }

declare var ItemXMLInfo: any;
// = {
//     getName: (id: number) => string,
// }

type BaseUseSkillInfo = {
    new(data: any): any;
}

declare var UseSkillInfo: BaseUseSkillInfo;