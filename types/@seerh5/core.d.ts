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
    _mainPanelName: string;
    panelMap: { [panel: string]: BasicPanel };
    service: BasicModuleService;
    currentPanel?: BasicPanel;
    init(): void;
    initialized(): void;
    openPanel(panelName: string): Promise<void>;
    onShowMainPanel(): Promise<void>;
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
    constructor(data: egret.ByteArray);
    id: number;
    name: string;
    catchTime: number;
    dv: number;
    nature: number;
    hideSKill: PetSkillInfo;
    skillArray: Array<PetSkillInfo>;
    isDefault: boolean;
    _skinId: number;
    base_hp_total: number;
    base_curHp: number;
    get hp(): number;
    get maxHp(): number;
    get skinId(): number;
    set skinId(id: number);
    getTeamTechAdd(index: number): number[];
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

declare class PetTakeOutInfo {
    constructor(data: egret.ByteArray);
    firstPetTime: number;
}

declare class PetListInfo {
    catchTime: number;
    id: number;
    get name(): string;
}

declare class PetStorage2015PetInfo extends PetListInfo {
    level: number;
    posi: number;
    type: number;
}

declare class FighterUserInfos {
    get myInfo(): FighterUserInfo;
}

declare class FighterUserInfo {
    get id(): number;
    get petCatchArr(): number[];
    get petInfoArr(): PetInfo[];
}

declare class FightPetInfo {
    get hp(): number;
    get petID(): number;
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
    GET_PET_INFO: 2301;
    PET_RELEASE: 2304;
    PET_CURE: 2306;
    PET_DEFAULT: 2308;
    PET_ONE_CURE: 2310;
    USE_PET_ITEM_OUT_OF_FIGHT: 2326;
    ADD_LOVE_PET: 2362;
    DEL_LOVE_PET: 2363;

    NOTE_USE_SKILL: 2505;

    GET_PET_INFO_BY_ONCE: 43706;
};

declare class BubblerManager {
    static getInstance(): BubblerManager;
    showText(text: string, isHtml?: boolean): void;
}

type BitValue = 0 | 1;
declare class KTool {
    static getMultiValueAsync(value: number[]): PromiseLike<number[]>;
    static getBitSetAsync(value: number[]): PromiseLike<BitValue[]>;
    static getPlayerInfoValueAsync(value: number[]): PromiseLike<number[]>;
}

declare class MainManager {
    static actorID: number;
    static actorInfo: {
        clothIDs: number[];
        curTitle: number;
        vipScore: number;
        readonly coins: number;
        readonly logintimeThisTime: number;
        readonly timeToday: number;
        readonly timeLimit: number;
        requestChangeClotherBySuit(suitId: number, callback?: CallBack, arg?: unknown, thisArg?: any): void;
    };
}

declare class ModuleManager {
    static beginShow(moduleName: string): Promise<void>;
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
    static showModuleByID(moduleId: number, params?: any): Promise<void>;
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

declare class LevelManager {
    static get stage(): egret.Stage;
}

declare class ItemManager {
    static getSkillStoneInfos(): Array<{
        itemLevel: number;
        itemNum: number;
        itemID: number;
        type: number;
    }>;

    static getSkillStone(): void;
    static getNumByID(id: number): number;
    static updateItems(idList: number[] | undefined, n: CallBack): void;
    static updateItemNum(idList: number[], enable: boolean[]): void;
    /** @description 获取精灵背包内物品 */
    static getPetItemIDs(): number[];
    static GetMySuitIds(): number[];
}

declare class ItemUseManager {
    static getInstance(): ItemUseManager;
    useItem(t: PetInfo, e: number): void;
    $usePetItem(obj: { petInfo: PetInfo; itemId: number; itemName: string }, e: number): void;
}

declare class PetManager {
    static getPetInfo(catchTime: number): PetInfo;
    static UpdateBagPetInfoAsynce(catchtime: number): PromiseLike<PetInfo>;
    static upDateBagPetInfo(catchtime: number, callback: (info: PetInfo) => any);
    static updateBagInfo(callback?: CallBack): void;
    static getLovePetList(): void;

    static bagToSecondBag(catchTime: number): Promise<void>;
    static bagToStorage(catchTime: number): Promise<void>;
    static secondBagToBag(catchTime: number): Promise<void>;
    static secondBagToStorage(catchTime: number): Promise<void>;
    static storageToBag(catchTime: number, callback: CallBack): void;
    static storageToSecondBag(catchTime: number): Promise<void>;
    static loveToBag(catchTime: number): Promise<void>;

    static delLovePet(arg0: number, catchTime: number, arg2: number): void;
    static addLovePet(arg0: number, catchTime: number, arg2: number): void;
    static noAlarmCureAll(): void;
    static setDefault(catchTime: number): void;
    static equipSkin(catchTime: number, skinId: number, callback: CallBack): PromiseLike<void>;
    static dispatchEvent(e: PetEvent): void;
    static isBagFull: boolean;
    static isSecondBagFull: boolean;
    static _bagMap: SAType.HashMap<PetInfo>;
    static _secondBagMap: SAType.HashMap<PetInfo>;
    static infos: PetInfo[];
    static secondInfos: PetInfo[];
    static secondBagTotalLength: number;
    static get defaultTime(): number;
    static set defaultTime(ct: number);
}

declare class PetStorage2015InfoManager {
    static getMiniInfo(callback: CallBack, page: number = 0): void;
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
    static titleRules: Dict<SAType.TitleObj>;
    static isAbilityTitle(id: number): boolean;
    static getTitle(id: number): string;
    static getTitleDesc(id: number): string;
    static getTitleEffDesc(id: number): string;
}

declare class ItemXMLInfo {
    static _itemDict: Dict<SAType.ItemObj>;
    static getName(id: number): string;
    static getItemObj(id: number): SAType.ItemObj | undefined;
    static getSkillStoneRank(id: number): number;
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
    static movesMap: Dict<SAType.MoveObj>;
    static moveStoneMap: Dict<SAType.MoveObj>;
    static typeMap: {
        [Property: string]: SAType.ElementObj;
    };
    static getName(id: number): string;
    static getTypeID(id: number): number;
    static getCategory(id: number): number;
    static getCategoryName(id: number): string;
    static getHideSkillId(petId: number): number;
    static getSkillObj(id: number): SAType.MoveObj | undefined;
    static getStoneBySkill(id: number): number | undefined;
}

declare class SuitXMLInfo {
    static _dataMap: SAType.HashMap<SAType.SuitObj>;
    static getName(id: number): string;
    static getIsElite(id: number): boolean;
    static getSuitID(clothIds: number[]): number;
}

declare class PetXMLInfo {
    static _dataMap: Dict<SAType.PetObj>;
    static getType(id: number): number;
    static getName(id: number): string;
}

declare class PetStatusEffectConfig {
    static xml: {
        BattleEffect: [{ Name: string; SubEffect: SAType.StatusEffectObj[] }];
    };
}
