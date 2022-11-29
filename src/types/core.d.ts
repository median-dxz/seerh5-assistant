declare class BaseModule {
    touchHandle: SAType.EventHandler<EgretEventTarget>;
    onClose: CallBack;
    moduleName: string;
}

declare class CountermarkInfo {
    get markName(): string;
    get isBindMon(): boolean;
    get obtainTime(): number;
    get markID(): number;
    get level(): number;
    get catchTime(): number;
}

declare class PetInfo {
    id: number;
    name: string;
    catchTime: number;
    dv: number;
    hideSKill: PetSkillInfo;
    skillArray: Array<PetSkillInfo>;
    get hp(): number;
    get maxHp(): number;
    get skinId(): number;
    set skinId(id: number);
}

declare class PetSkillInfo {
    pp: number;
    private _id: number;
    get damage(): number;
    get id(): number;
    get isFullPP(): boolean;
    get maxPP(): number;
    get name(): string;
}

declare class PetStorage2015PetInfo {
    catchTime: number;
    id: number;
    level: number;
    posi: number;
    type: number;
    get name(): string;
}

declare class FighterUserInfos {
    get myInfo(): FighterUserInfo;
}

declare class FighterUserInfo {
    get id(): number;
    get petCatchArr(): number[];
}

declare class AttackValue {
    get round(): number;
    get userID(): number;
    get skillID(): number;
    get petcatchtime(): number;
    get gainHP(): number;
    get lostHP(): number;
    get maxHp(): number;
    get remainHP(): number;
    get isCrit(): number;
    get priority(): number;
    get effectName(): string;
    get status(): number[];
    get sideEffects(): number[];
}

declare class UseSkillInfo {
    constructor(data: egret.ByteArray);
    private _firstAttackInfo: AttackValue;
    private _secondAttackInfo: AttackValue;
    get firstAttackInfo(): AttackValue;
    get secondAttackInfo(): AttackValue;
}

declare const CommandID: {
    [commandID: string]: number;
};

declare class BubblerManager {
    static getInstance(): BubblerManager;
    showText(text: string): void;
}

declare namespace ModuleManager {
    function beginShow(moduleName: string): void;
    function _openModelCompete(): void;
    function loadScript(scriptName: string): Promise<void>;
    function hasmodule(moduleName: string): boolean;
    function showModule(moduleName: string): Promise<void>;
    const appJs: {
        [module: string]: boolean;
    };
    const currModule: BaseModule;
}

declare namespace FightManager {
    const isWin: boolean | undefined;
    function fightNoMapBoss(id: number, r?: boolean, o?: boolean, callback?: CallBack): void;
    function fightNoMapBoss(arg0: '', id: number, r?: boolean, o?: boolean, callback?: CallBack): void;
}

declare namespace FightUserInfo {
    const fighterInfos: FighterUserInfos | null;
}

declare namespace ItemManager {
    function getNumByID(id: number): number;
    function updateItems(e: number[] | undefined, n: CallBack): void;
    function getPetItemIDs(): number[];
}

declare namespace PetManager {
    function getPetInfo(catchTime: number): PetInfo;
    function UpdateBagPetInfoAsynce(catchtime: number): PromiseLike<PetInfo>;
    function getLovePetList(): void;
    function updateBagInfo(callback: CallBack): void;
    function secondBagToBag(catchTime: number): void;
    function storageToBag(catchTime: number): void;
    function bagToSecondBag(catchTime: number): void;
    function storageToSecondBag(catchTime: number): void;
    function loveToBag(catchTime: number): void;
    function delLovePet(arg0: number, catchTime: number, arg2: number): void;
    function bagToStorage(catchTime: number): void;
    function secondBagToStorage(catchTime: number): void;
    function addLovePet(arg0: number, catchTime: number, arg2: number): void;
    function noAlarmCureAll(): void;
    function getLovePetList(): void;
    function setDefault(catchTime: number): void;
    function equipSkin(catchTime: number, skinId: number, callback: CallBack): PromiseLike<void>;
    function dispatchEvent(e: PetEvent): void;
    const isBagFull: boolean;
    const isSecondBagFull: boolean;
    const _bagMap: SAType.HashMap<PetInfo>;
    const _secondBagMap: SAType.HashMap<PetInfo>;
    const defaultTime: number;
}

declare namespace PetStorage2015InfoManager {
    function getTotalInfo(callback: CallBack): void;
    function getInfoByType(arg1: number, arg2: number): PetStorage2015PetInfo[];
    function changePetPosi(catchTime: number, location: number): void;
    const allInfo: PetStorage2015PetInfo[];
}

declare namespace CountermarkController {
    function getInfo(obtainTime: number): CountermarkInfo;
    function updateMnumberMark(markInfo: Pick<CountermarkInfo, 'markID' | 'catchTime'>): void;
    function getAllUniversalMark(): Array<CountermarkInfo>;
}

declare namespace ItemXMLInfo {
    const _itemDict: SAType.Dict<SAType.ItemObj>;
    function getName(id: number): string;
    function getItemObj(id: number): SAType.ItemObj;
}

declare namespace SkillXMLInfo {
    const SKILL_OBJ: {
        Moves: { Move: Array<SAType.MoveObj> };
        SideEffects: { SideEffect: Array<SAType.SideEffectObj>; _text: Array<string> };
    };
    const movesMap: SAType.Dict<SAType.MoveObj>;
    const typeMap: {
        [Property: string]: {
            id: number;
            en: string;
            cn: string;
        };
    };
    function getName(id: number): string;
    function getTypeID(id: number): number;
    function getCategoryName(id: number): string;
    function getHideSkillId(petId: number): number;
    function getSkillObj(id: number): SAType.MoveObj;
}

declare namespace PetXMLInfo {
    const _dataMap: SAType.Dict<SAType.PetObj>;
    function getType(id: number): number;
    function getName(id: number): string;
}
