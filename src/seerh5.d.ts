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
    name?: string;
    id?: number;
};

//common
declare var CommandID: {
    [cmdid: string]: number;
};

declare namespace ModuleManager {
    function beginShow(moduleName: string): void;
    function _openModelCompete(): void;
    function loadScript(scriptName: string): Promise<void>;
    function hasmodule(moduleName: string): boolean;
    function showModule(moduleName: string): Promise<void>;
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
    var propView: any;
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
    getName(id: number): string;
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
    getName(id: number): string;
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

interface PetManager {
    getPetInfo(catchTime: number): PetInfo;
    getLovePetList(): void;
    updateBagInfo(callback: CallBack): void;
    secondBagToBag(ct: number): void;
    storageToBag(ct: number): void;
    bagToSecondBag(ct: number): void;
    storageToSecondBag(ct: number): void;
    loveToBag(ct: number): void;
    delLovePet(arg0: number, ct: number, arg2: number): void;
    bagToStorage(ct: number): void;
    secondBagToStorage(ct: number): void;
    addLovePet(arg0: number, ct: number, arg2: number): void;
    noAlarmCureAll(): void;
    getLovePetList(): void;
    setDefault(ct: number): void;
    equipSkin(e: number, n: number, r: () => any): Promise<void>;
    dispatchEvent(e: PetEvent): void;
    isBagFull: boolean;
    isSecondBagFull: boolean;
    _bagMap: StringMapable;
    _secondBagMap: StringMapable;
    defaultTime: number;
}
declare var PetManager: PetManager;

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
declare var UseSkillInfo: UseSkillInfo;

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
declare interface PetInfo {
    hideSKill: PetSkillInfoBase;
    skillArray: PetSkillInfoBase[];
    id: number;
    name: string;
    catchTime: number;
    maxHp: number;
    hp: number;
    dv: number;
    skinId: number;
    new (data: any): PetInfo;
}

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

// mods
declare var SystemTimerManager: any;
declare var MainManager: any;
declare var markCenter: any;
declare var FighterUserInfos: any;
declare var FightPetInfo: any;
declare var PetInfo: PetInfo;
declare var PetSkinController: any;
declare var PetSkinXMLInfo: any;
declare var ClientConfig: any;
declare interface PetEvent {
    new (e: string, oi: number, ni: number): PetEvent;
    [EventType: string]: string;
}
declare var PetEvent: PetEvent;
