declare class AwardBaseDialog extends eui.Component {
    startEvent(): void;
    destroy(): void;
}

declare class AwardItemDialog extends AwardBaseDialog {
    startRemoveDialog(e: egret.Event): void;
}

declare class BaseModule extends eui.Component {
    touchHandle(): void;
    onClose(): void;
}

declare class BasicPanel extends eui.Component {}

declare class BasicModuleService extends egret.EventDispatcher {
    openPanel(panelName: string, ...params: any[]): void;
}

declare class BasicMultPanelModule extends BaseModule {
    moduleName: string;
    panelMap: { [panel: string]: BasicPanel };
    service: BasicModuleService;
    currentPanel?: BasicPanel;
    getModuleConfig(): unknown;
    resList: unknown[];
    resEffectList: unknown[];
}

declare class SkillMC extends egret.DisplayObjectContainer {
    animation: any;
}

declare class AchieveTitleInfo {
    constructor(data: egret.ByteArray);
    get titleArr(): number[];
}

declare class DBSkillAnimator {
    static skillMC: SkillMC;
    skillId: number;
    play(_: any, callback: CallBack, thisObj: any): void;
}

declare class CardPetAnimator {
    animate: any;
    playAnimate(t: any, e: CallBack, i: CallBack, thisObj: any): void;
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

declare class FightPetInfo {
    get petName(): string;
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

type BitValue = 0 | 1;
declare class KTool {
    static getMultiValueAsync(value: number[]): PromiseLike<number[]>;
    static getBitSetAsync(value: number[]): PromiseLike<BitValue[]>;
}

declare class MainManager {
    static actorID: number;
    static actorInfo: {
        clothIDs: number[];
        curTitle: number;
        readonly logintimeThisTime: number;
        requestChangeClotherBySuit(suitId: number, callback: CallBack): void;
    };
}

declare class ModuleManager {
    static beginShow(moduleName: string): void;
    static _openModelCompete(): void;
    static _addModuleToFreeRes(moduleName: string, resList: unknown[], resEffectList: unknown[], config: unknown): void;
    static loadScript(scriptName: string): Promise<void>;
    static hasmodule(moduleName: string): boolean;
    static showModule(
        moduleName: string,
        n?: string[],
        r?: any,
        o?: any,
        i?: any,
        style?: AppDoStyle[keyof AppDoStyle]
    ): Promise<void>;
    static showModuleByID(moduleId: number): Promise<void>;
    static removeModuleInstance(module: BasicMultPanelModule): void;
    static appJs: {
        [module: string]: boolean;
    };
    static _modules: {
        [module: string]: BasicMultPanelModule;
    };
    static currModule: BaseModule;
}

declare class FightManager {
    static isWin: boolean | undefined;
    static fightAnimateMode: number;
    static fightNoMapBoss(id: number, r?: boolean, o?: boolean, callback?: CallBack): void;
    static fightNoMapBoss(arg0: '', id: number, r?: boolean, o?: boolean, callback?: CallBack): void;
}

declare class FightUserInfo {
    static fighterInfos: FighterUserInfos | null;
}

declare class ItemManager {
    static getNumByID(id: number): number;
    static updateItems(e: number[] | undefined, n: CallBack): void;
    /** @description 获取精灵背包内物品 */
    static getPetItemIDs(): number[];
    static GetMySuitIds(): number[];
}

declare class ItemUseManager {
    useItem(t: SAType.PetObj, e: number): void;
    $usePetItem(obj: { petInfo: SAType.PetObj; itemId: number; itemName: string }, e: number): void;
}

declare class PetManager {
    static getPetInfo(catchTime: number): PetInfo;
    static UpdateBagPetInfoAsynce(catchtime: number): PromiseLike<PetInfo>;
    static getLovePetList(): void;
    static updateBagInfo(callback: CallBack): void;
    static secondBagToBag(catchTime: number): void;
    static storageToBag(catchTime: number): void;
    static bagToSecondBag(catchTime: number): void;
    static storageToSecondBag(catchTime: number): void;
    static loveToBag(catchTime: number): void;
    static delLovePet(arg0: number, catchTime: number, arg2: number): void;
    static bagToStorage(catchTime: number): void;
    static secondBagToStorage(catchTime: number): void;
    static addLovePet(arg0: number, catchTime: number, arg2: number): void;
    static noAlarmCureAll(): void;
    static getLovePetList(): void;
    static setDefault(catchTime: number): void;
    static equipSkin(catchTime: number, skinId: number, callback: CallBack): PromiseLike<void>;
    static dispatchEvent(e: PetEvent): void;
    static isBagFull: boolean;
    static isSecondBagFull: boolean;
    static _bagMap: SAType.HashMap<PetInfo>;
    static _secondBagMap: SAType.HashMap<PetInfo>;
    static defaultTime: number;
}

declare class PetStorage2015InfoManager {
    static getTotalInfo(callback: CallBack): void;
    static getInfoByType(arg1: number, arg2: number): PetStorage2015PetInfo[];
    static changePetPosi(catchTime: number, location: number): void;
    static allInfo: PetStorage2015PetInfo[];
}

declare class CountermarkController {
    static getInfo(obtainTime: number): CountermarkInfo;
    static updateMnumberMark(markInfo: Pick<CountermarkInfo, 'markID' | 'catchTime'>): void;
    static getAllUniversalMark(): Array<CountermarkInfo>;
}

declare class AchieveXMLInfo {
    static isAbilityTitle(id: number): boolean;
    static getTitle(id: number): string;
    static getTitleDesc(id: number): string;
    static getTitleEffDesc(id: number): string;
}

declare class ItemXMLInfo {
    static _itemDict: SAType.Dict<SAType.ItemObj>;
    static getName(id: number): string;
    static getItemObj(id: number): SAType.ItemObj;
}

declare class ItemSeXMLInfo {
    static getAllAbilitySuit(): string[];
    static getIsEffSuit(id: number): boolean;
    static getSuitEff(id: number): string;
}

declare class SkillXMLInfo {
    static SKILL_OBJ: {
        Moves: { Move: Array<SAType.MoveObj> };
        SideEffects: { SideEffect: Array<SAType.SideEffectObj>; _text: Array<string> };
    };
    static movesMap: SAType.Dict<SAType.MoveObj>;
    static typeMap: {
        [Property: string]: {
            id: number;
            en: string;
            cn: string;
        };
    };
    static getName(id: number): string;
    static getTypeID(id: number): number;
    static getCategory(id: number): number;
    static getCategoryName(id: number): string;
    static getHideSkillId(petId: number): number;
    static getSkillObj(id: number): SAType.MoveObj;
}

declare class SuitXMLInfo {
    static getName(id: number): string;
    static getIsElite(id: number): boolean;
    static getSuitID(clothIds: number[]): number;
}

declare class PetXMLInfo {
    static _dataMap: SAType.Dict<SAType.PetObj>;
    static getType(id: number): number;
    static getName(id: number): string;
}
