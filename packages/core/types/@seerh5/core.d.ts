type Callback = seerh5.Callback;

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
    show(): void;
    hide(): void;
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
    play(_: unknown, callback: Callback, thisObj: unknown): void;
}

declare class CardPetAnimator {
    animate: any;
    playAnimate(_: unknown, e: Callback, i: Callback, thisObj: unknown): void;
}

declare class CountermarkInfo {
    get markName(): string;
    get isBindMon(): boolean;
    get obtainTime(): number;
    get markID(): number;
    get level(): number;
    get catchTime(): number;
}

declare class EffectInfo {
    argsNum: number;
    getInfo(effects: number[]): string;
}

declare class PetInfo {
    constructor(data: egret.ByteArray);
    id: number;
    name: string;
    catchTime: number;
    level: number;
    dv: number;
    nature: number;
    hideSKill: PetSkillInfo;
    skillArray: Array<PetSkillInfo>;
    effectList: Array<PetEffectInfo>;
    isDefault: boolean;
    base_hp_total: number;
    base_curHp: number;
    _skinId: number;
    get hp(): number;
    get maxHp(): number;
    get skinId(): number;
    set skinId(id: number);
    getTeamTechAdd(index: number): number[];
}

declare class PetEffectInfo {
    effectID: number;
    args: string;
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
    flag: boolean;
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
    get maxHP(): number;
    get petID(): number;
    get petName(): string;
    get userID(): number;
    get catchTime(): number;
}

declare class AttackValue {
    get round(): number;
    get userID(): number;
    get skillID(): number;
    get petcatchtime(): number;
    get gainHP(): number;
    get lostHP(): number;
    get maxHp(): number;
    private _maxHP: number;
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

declare class UserInfo extends egret.EventDispatcher {
    curTitle: number;
    vipScore: number;
    clothIDs: number[];
    readonly vipScoreMax: number;
    readonly coins: number;
    readonly logintimeThisTime: number;
    readonly timeToday: number;
    readonly timeLimit: number;
    requestChangeClotherBySuit(suitId: number, callback?: Callback, arg?: unknown, thisArg?: any): void;
}

declare class AwardManager {
    static resume(): void;
    static showDialog(
        dialog: unknown,
        items: Array<{
            id: number;
            count: number;
        }>
    ): void;
}

declare class BubblerManager {
    static getInstance(): BubblerManager;
    showText(text: string, isHtml?: boolean): void;
}

type Bit = 0 | 1;
declare class KTool {
    static getMultiValueAsync(value: number[]): PromiseLike<number[]>;
    static getBitSetAsync(value: number[]): PromiseLike<Bit[]>;
    static getPlayerInfoValueAsync(value: number[]): PromiseLike<number[]>;
}

declare class MainManager {
    static actorID: number;
    static actorInfo: UserInfo;
}

declare class ModuleManager {
    static beginShow(
        moduleName: string,
        n?: string[],
        o?: string,
        r?: unknown,
        i?: number,
        moduleConfig?: object | null
    ): Promise<void>;
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
    static CloseAll(): void;
    static appJs: {
        [module: string]: boolean;
    };
    static _modules: {
        [module: string]: BasicMultPanelModule;
    };
    static currModule: BaseModule;
}

declare class BatteryController {
    static Instance: BatteryController;
    _leftTime: number;
}

declare class ClientConfig {
    static getItemIcon(id: number): string;
    static getPetHeadPath(id: number): string;
}

declare class EffectInfoManager {
    static getEffect(id: number): EffectInfo;
}

declare class FightManager {
    static isWin: boolean | undefined;
    static fightAnimateMode: number;
    static fightNoMapBoss(id: number, r?: boolean, o?: boolean, callback?: Callback): void;
    static fightNoMapBoss(arg0: '', id: number, r?: boolean, o?: boolean, callback?: Callback): void;
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
    static updateItems(idList: number[] | undefined, n: Callback): void;
    static updateItemNum(idList: number[], enable: boolean[]): void;
    /** @description 获取精灵背包内物品 */
    static getPetItemIDs(): number[];
    static GetMySuitIds(): number[];
    static getClothIDs(): number[];
}

declare class ItemUseManager {
    static getInstance(): ItemUseManager;
    useItem(t: PetInfo, e: number): void;
    $usePetItem(obj: { petInfo: PetInfo; itemId: number; itemName: string }, e: number): void;
}

declare class PetManager {
    static getPetInfo(catchTime: number): PetInfo;
    static UpdateBagPetInfoAsynce(catchtime: number): PromiseLike<PetInfo>;
    static upDateBagPetInfo(catchtime: number, callback: (info: PetInfo) => any): void;
    static updateBagInfo(callback?: Callback): void;
    static getLovePetList(): void;

    static bagToSecondBag(catchTime: number): Promise<void>;
    static bagToStorage(catchTime: number): Promise<void>;
    static secondBagToBag(catchTime: number): Promise<void>;
    static secondBagToStorage(catchTime: number): Promise<void>;
    static storageToBag(catchTime: number, callback: Callback): void;
    static storageToSecondBag(catchTime: number): Promise<void>;
    static loveToBag(catchTime: number): Promise<void>;

    static delLovePet(id: number, catchTime: number, level: number): void;
    static addLovePet(id: number, catchTime: number, level: number): void;
    static noAlarmCureAll(): void;
    static setDefault(catchTime: number): Promise<void>;
    static _setDefault(catchTime: number): void;
    static equipSkin(catchTime: number, skinId: number, callback: Callback): PromiseLike<void>;
    static checkPetInfoEffect(pet: Pick<PetInfo, 'id' | 'effectList'>, callback: (activated: boolean) => void): void;
    static dispatchEvent(e: PetEvent): void;

    static onDelLovePetSuccessHandler(catchTime: number): void;
    static onAddLovePetSuccessHandler(catchTime: number): void;
    static curRetrieveLovePetInfo: PetListInfo;
    static curLovePetInfo: PetListInfo;

    static isBagFull: boolean;
    static isSecondBagFull: boolean;
    static _bagMap: seerh5.HashMap<PetInfo>;
    static _secondBagMap: seerh5.HashMap<PetInfo>;
    static infos: PetInfo[];
    static secondInfos: PetInfo[];
    static secondBagTotalLength: number;
    static get defaultTime(): number;
    static set defaultTime(ct: number);
}

declare class PetStorage2015InfoManager {
    /**
     * @param {number} page 默认为0
     */
    static getMiniInfo(callback: Callback, page?: number): void;
    static getTotalInfo(callback: Callback): void;
    static getInfoByType(arg1: number, arg2: number): PetStorage2015PetInfo[];
    static changePetPosi(catchTime: number, location: number): void;
    static allInfo: PetStorage2015PetInfo[];
}

declare class SystemTimerManager {
    static queryTime(): void;
    static sockettimeout(): void;
    static time: number;
    static sysBJDate: {
        getTime(): number;
    };
}

declare class CountermarkController {
    static getInfo(obtainTime: number): CountermarkInfo;
    static updateMnumberMark(markInfo: Pick<CountermarkInfo, 'markID' | 'catchTime'>): void;
    static getAllUniversalMark(): Array<CountermarkInfo>;
}

declare class EffectIconControl {
    static _hashMapByPetId: seerh5.HashMap<Array<{ Id: number }>>;
}

declare class AchieveXMLInfo {
    static titleRules: seerh5.Dict<seerh5.TitleObj>;
    static isAbilityTitle(id: number): boolean;
    static getTitle(id: number): string;
    static getTitleDesc(id: number): string;
    static getTitleEffDesc(id: number): string;
}

declare class ItemXMLInfo {
    static _itemDict: seerh5.Dict<seerh5.ItemObj>;
    static getName(id: number): string;
    static getItemObj(id: number): seerh5.ItemObj | undefined;
    static getSkillStoneRank(id: number): number;
}

declare class ItemSeXMLInfo {
    static getAllAbilitySuit(): string[];
    static getIsEffSuit(id: number): boolean;
    static getSuitEff(id: number): string;
}

declare class SkillXMLInfo {
    static SKILL_OBJ: {
        Moves: { Move: Array<seerh5.MoveObj> };
        SideEffects: { SideEffect: Array<seerh5.SideEffectObj>; _text: Array<string> };
    };
    static movesMap: seerh5.Dict<seerh5.MoveObj>;
    static moveStoneMap: seerh5.Dict<seerh5.MoveObj>;
    static hideMovesMap: Record<number, Array<{ o: number; id: number }>>;
    static typeMap: {
        [Property: string]: seerh5.ElementObj;
    };
    static getName(id: number): string;
    static getTypeID(id: number): number;
    static getCategory(id: number): number;
    static getCategoryName(id: number): string;
    static getHideSkillId(petId: number): number;
    static getSkillObj(id: number): seerh5.MoveObj | undefined;
    static getStoneBySkill(id: number): number | undefined;
}

declare class SuitXMLInfo {
    static _dataMap: seerh5.HashMap<seerh5.SuitObj>;
    static getName(id: number): string;
    static getIsElite(id: number): boolean;
    static getSuitID(clothIds: number[]): number;
    static getSuitIDs(clothIds: number[]): number[];
}

declare class PetXMLInfo {
    static _dataMap: seerh5.Dict<seerh5.PetObj>;
    static getType(id: number): number;
    static getName(id: number): string;
}

declare class PetStatusEffectConfig {
    static xml: {
        BattleEffect: [{ Name: string; SubEffect: seerh5.StatusEffectObj[] }];
    };
}

declare class TypeXMLInfo {
    static getRelationsPow(a: string, b: string): number;
}

declare class PetUpdateCmdListener {
    static onUpdateSkill(): void;
}
