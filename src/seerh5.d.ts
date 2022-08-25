// helper
interface EgertEventTarget extends EventTarget {
    dispatchEventWith: Fn;
}

declare type PetSkillInfoBase = {
    id: number;
    name: string;
};

declare type PetInfoBase = {
    catchTime: number;
    name: string;
    id: number;
};

//common
declare var CommandID: {
    [cmdid: string]: number;
};

declare namespace ModuleManager {
    function beginShow(moduleName: string): void;
    function _openModelCompete(): void;
    function loadScript(scriptName: string): Promise<void>;
    var appJs: {
        [module: string]: boolean;
    };
    var currModule: any;
}

declare namespace FighterModelFactory {
    interface FighterModel {
        setHpView: Fn;
        skillBtnViews: any[];
        subject: {
            array: any[];
        };
        info: {
            petName: string;
        };
        propView: any;
    }

    interface PropView {
        isShowFtHp: boolean;
    }

    var playerMode: FighterModel | undefined;
    var enemyMode: FighterModel | undefined;
}

declare namespace SocketConnection {
    function addCmdListener(cmdid: number, callback: CallBack): void;
    function removeCmdListener(cmdid: number, callback: CallBack): void;
    function sendByQueue(cmd: number, data: Array<number>, resolve: Fn, reject: Fn): void;
}

declare var EventManager: EgertEventTarget;

type StringMapable = {
    [Property: string]: any;
    getValues(): any[];
};

declare var ItemXMLInfo: {
    _itemDict: StringMapable;
};

declare namespace SkillXMLInfo {
    var SKILL_OBJ: any;
    var movesMap: StringMapable;
    var typeMap: {
        [Property: string]: {
            id: number;
            en: string;
            cn: string;
        };
    };
    function getName(id: number): string;
    function getTypeID(id: number): number;
    function getCategoryName(id: number): string;
    function getSkillObj(id: number): PetSkillInfo;
}

declare var PetXMLInfo: {
    _dataMap: StringMapable;
    getType(id: number): number;
};

declare namespace ItemManager {
    function getNumByID(id: number): any;
}

declare interface MarkInfo {
    obtainTime: number;
    markID?: number;
    level?: number;
    catchTime?: number;
}

declare namespace CountermarkController {
    type CountermarkGroup = Map<string, Array<any>>;
    function getInfo(obtainTime: number): MarkInfo;
    function updateMnumberMark(markInfo: Pick<MarkInfo, 'markID' | 'catchTime'>): void;
    function getAllUniversalMark(): CountermarkGroup[];
}

declare namespace PetManager {
    function getPetInfo(catchTime: number): PetInfo;
    function getLovePetList(): void;
    function updateBagInfo(callback: CallBack): void;
    function secondBagToBag(ct: number): void;
    function storageToBag(ct: number): void;
    function bagToSecondBag(ct: number): void;
    function storageToSecondBag(ct: number): void;
    function loveToBag(ct: number): void;
    function delLovePet(arg0: number, ct: number, arg2: number): void;
    function bagToStorage(ct: number): void;
    function secondBagToStorage(ct: number): void;
    function addLovePet(arg0: number, ct: number, arg2: number): void;
    function noAlarmCureAll(): void;
    function getLovePetList(): void;
    function setDefault(ct: number): void;
    var isBagFull: boolean;
    var isSecondBagFull: boolean;
    var _bagMap: StringMapable;
    var _secondBagMap: StringMapable;
    var defaultTime: number;
}

declare namespace PetStorage2015InfoManager {
    function getTotalInfo(callback: CallBack): void;
    function getInfoByType(arg1: number, arg2: number): any[];
    function changePetPosi(ct: number, location: number): void;
    var allInfo: any[];
}

// saloader
declare var egret: any;
declare var RES: any;
declare var hideSerialID: Function | undefined;
declare var LoginService: any;
declare var OnlineManager: any;

// init/event
declare var AwardItemDialog: any;
declare var AwardManager: any;
declare var LevelManager: any;
declare var PetFightController: any;
declare var PetUpdatePropController: any;
declare var FightManager: any;
declare interface UseSkillInfo {
    new (data: any): any;
    round: number;
    userID: number;
    skillID: number;
    petcatchtime: number;
    gainHP: number;
    lostHP: number;
    maxHp: number;
    remainHP: number;
    isCrit: number;
    priority: number;
    effectName: string;
    status: number[];
    sideEffects: number[];
}

// init/helper
declare var Alarm: any;
declare var BubblerManager: any;

// init/socket
declare var SocketEncryptImpl: any;

// utils/sa-utils
declare var KTool: any;
declare var CountermarkEvent: any;
declare var PetStatusEffectConfig: any;

// entitis
declare type PetInfo = {
    hideSKill: PetSkillInfoBase;
    skillArray: PetSkillInfoBase[];
    id: number;
    name: string;
    catchTime: number;
    maxHp: number;
    hp: number;
    dv: number;
};

declare var FightUserInfo: {
    fighterInfos?: {
        myInfo: {
            _petCatchArr: number[];
            id: number;
        };
    };
};
declare type PetSkillInfo = {
    ID: number;
    Name: string;
    Type: number;
    Category: number;
    Power?: number;
    Priority?: number;
    Accuracy: number;
    pp: number;
    MaxPP: number;
    SideEffect: string;
    SideEffectArg: string;
    MustHit: number;
};

declare var EffectInfoManager: any;

// pet-helper
declare var TypeXMLInfo: any;
