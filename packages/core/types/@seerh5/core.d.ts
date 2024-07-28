type Callback = seerh5.Callback;
type Bit = 0 | 1;

declare global {
    class AwardBaseDialog extends eui.Component {
        startEvent(): void;
        destroy(): void;
    }

    class AwardItemDialog extends AwardBaseDialog {
        startRemoveDialog(e: egret.Event): void;
    }

    class BaseModule extends eui.Component {
        touchHandle(): void;
        onClose(): void;
        show(): void;
        hide(): void;
    }

    class BasicPanel extends eui.Component {}

    class BasicModuleService extends egret.EventDispatcher {
        openPanel(panelName: string, ...params: any[]): void;
    }

    class BasicMultPanelModule extends BaseModule {
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

    class SkillMC extends egret.DisplayObjectContainer {
        animation: any;
    }

    class AchieveTitleInfo {
        constructor(data: egret.ByteArray);
        get titleArr(): number[];
    }

    class DBSkillAnimator {
        static skillMC: SkillMC;
        skillId: number;
        play(_: unknown, callback: Callback, thisObj: unknown): void;
    }

    class CardPetAnimator {
        animate: any;
        playAnimate(_: unknown, e: Callback, i: Callback, thisObj: unknown): void;
    }

    class CountermarkInfo {
        get markName(): string;
        get isBindMon(): boolean;
        get obtainTime(): number;
        get markID(): number;
        get level(): number;
        get catchTime(): number;
    }

    class EffectInfo {
        argsNum: number;
        getInfo(effects: number[]): string;
    }

    class PetInfo {
        constructor(data: egret.ByteArray);
        id: number;
        name: string;
        catchTime: number;
        level: number;
        dv: number;
        nature: number;
        hideSKill: PetSkillInfo;
        skillArray: Array<PetSkillInfo>;
        effectList?: Array<PetEffectInfo>;
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

    class PetEffectInfo {
        effectID: number;
        args: string;
    }

    class PetSkillInfo {
        pp: number;
        private _id: number;
        get damage(): number;
        get id(): number;
        get isFullPP(): boolean;
        get maxPP(): number;
        get name(): string;
    }

    class PetTakeOutInfo {
        constructor(data: egret.ByteArray);
        firstPetTime: number;
        flag: boolean;
    }

    class PetListInfo {
        catchTime: number;
        id: number;
        get name(): string;
    }

    class PetStorage2015PetInfo extends PetListInfo {
        level: number;
        posi: number;
        type: number;
    }

    class FighterUserInfos {
        get myInfo(): FighterUserInfo;
    }

    class FighterUserInfo {
        get id(): number;
        get petCatchArr(): number[];
        get petInfoArr(): PetInfo[];
    }

    class FightPetInfo {
        get hp(): number;
        get maxHP(): number;
        get petID(): number;
        get petName(): string;
        get userID(): number;
        get catchTime(): number;
    }

    class AttackValue {
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

    class UseSkillInfo {
        constructor(data: egret.ByteArray);
        private _firstAttackInfo: AttackValue;
        private _secondAttackInfo: AttackValue;
        get firstAttackInfo(): AttackValue;
        get secondAttackInfo(): AttackValue;
    }

    class UserInfo extends egret.EventDispatcher {
        curTitle: number;
        vipScore: number;
        clothIDs: number[];
        readonly vipScoreMax: number;
        readonly coins: number;
        readonly logintimeThisTime: number;
        readonly timeToday: number;
        readonly timeLimit: number;
        requestChangeClotherBySuit(suitId: number, callback?: Callback, arg?: unknown, thisArg?: any): void;
        requestChangeClothes(type: 'head' | 'eye' | 'hand' | 'waist' | 'foot', id: number, callback?: Callback): void;
    }

    interface AwardManager {
        resume(): void;
        showDialog(
            dialog: unknown,
            items: Array<{
                id: number;
                count: number;
            }>
        ): void;
    }
    const AwardManager: AwardManager;

    class BubblerManager {
        static getInstance(): BubblerManager;
        showText(text: string, isHtml?: boolean): void;
    }

    interface KTool {
        getMultiValueAsync(value: number[]): PromiseLike<number[]>;
        getBitSetAsync(value: number[]): PromiseLike<Bit[]>;
        getPlayerInfoValueAsync(value: number[]): PromiseLike<number[]>;
    }
    const KTool: KTool;

    interface MainManager {
        actorID: number;
        actorInfo: UserInfo;
    }
    const MainManager: MainManager;

    interface ModuleManager {
        beginShow(
            moduleName: string,
            n?: string[],
            o?: string,
            r?: unknown,
            i?: number,
            moduleConfig?: object | null
        ): Promise<void>;
        _addModuleToFreeRes(moduleName: string, resList: unknown[], resEffectList: unknown[], config: unknown): void;
        loadScript(scriptName: string): Promise<void>;
        hasmodule(moduleName: string): boolean;
        showModule(
            moduleName: string,
            n?: string[],
            r?: any,
            o?: any,
            i?: any,
            style?: AppDoStyle[keyof AppDoStyle]
        ): Promise<void>;
        showModuleByID(moduleId: number, params?: any): Promise<void>;
        removeModuleInstance(module: BasicMultPanelModule): void;
        CloseAll(): void;
        appJs: {
            [module: string]: boolean;
        };
        _modules: {
            [module: string]: BasicMultPanelModule;
        };
        currModule: BaseModule;
    }
    const ModuleManager: ModuleManager;

    class BatteryController {
        static Instance: BatteryController;
        _leftTime: number;
    }

    interface ClientConfig {
        getItemIcon(id: number): string;
        getPetHeadPath(id: number): string;
    }
    const ClientConfig: ClientConfig;

    interface PetStatusEffectConfig {
        xml: {
            BattleEffect: [{ Name: string; SubEffect: seerh5.StatusEffectObj[] }];
        };
    }
    const PetStatusEffectConfig: PetStatusEffectConfig;

    interface EffectInfoManager {
        getEffect(id: number): EffectInfo;
    }
    const EffectInfoManager: EffectInfoManager;

    interface FightManager {
        isWin: boolean | undefined;
        fightAnimateMode: number;
        fightNoMapBoss(id: number, r?: boolean, o?: boolean, callback?: Callback): void;
        fightNoMapBoss(arg0: '', id: number, r?: boolean, o?: boolean, callback?: Callback): void;
    }
    const FightManager: FightManager;

    interface FightUserInfo {
        fighterInfos: FighterUserInfos | null;
    }
    const FightUserInfo: FightUserInfo;

    interface LevelManager {
        get stage(): egret.Stage;
    }
    const LevelManager: LevelManager;

    interface ItemManager {
        getSkillStoneInfos(): Array<{
            itemLevel: number;
            itemNum: number;
            itemID: number;
            type: number;
        }>;

        getSkillStone(): void;
        getNumByID(id: number): number;
        updateItems(idList: number[] | undefined, n: Callback): void;
        updateItemNum(idList: number[], enable: boolean[]): void;
        /** @description 获取精灵背包内物品 */
        getPetItemIDs(): number[];
        GetMySuitIds(): number[];
        getClothIDs(): string[];
    }
    const ItemManager: ItemManager;

    class ItemUseManager {
        static getInstance(): ItemUseManager;
        useItem(t?: PetInfo, e: number): void;
        $usePetItem(obj: { petInfo: PetInfo; itemId: number; itemName: string }, e: number): void;
    }

    interface PetManager {
        getPetInfo(catchTime: number): PetInfo;
        UpdateBagPetInfoAsynce(catchtime: number): PromiseLike<PetInfo>;
        upDateBagPetInfo(catchtime: number, callback: (info: PetInfo) => any): void;
        updateBagInfo(callback?: Callback): void;
        getLovePetList(): void;

        bagToSecondBag(catchTime: number): Promise<void>;
        bagToStorage(catchTime: number): Promise<void>;
        secondBagToBag(catchTime: number): Promise<void>;
        secondBagToStorage(catchTime: number): Promise<void>;
        storageToBag(catchTime: number, callback: Callback): void;
        storageToSecondBag(catchTime: number): Promise<void>;
        loveToBag(catchTime: number): Promise<void>;

        delLovePet(id: number, catchTime: number, level: number): void;
        addLovePet(id: number, catchTime: number, level: number): void;
        noAlarmCureAll(): void;
        setDefault(catchTime: number): Promise<void>;
        _setDefault(catchTime: number): void;
        equipSkin(catchTime: number, skinId: number, callback: Callback): PromiseLike<void>;
        checkPetInfoEffect(pet: Pick<PetInfo, 'id' | 'effectList'>, callback: (activated: boolean) => void): void;
        dispatchEvent(e: PetEvent): void;

        onDelLovePetSuccessHandler(catchTime: number): void;
        onAddLovePetSuccessHandler(catchTime: number): void;
        curRetrieveLovePetInfo: PetListInfo;
        curLovePetInfo: PetListInfo;

        isBagFull: boolean;
        isSecondBagFull: boolean;
        _bagMap: seerh5.HashMap<PetInfo>;
        _secondBagMap: seerh5.HashMap<PetInfo>;
        infos: PetInfo[];
        secondInfos: PetInfo[];
        secondBagTotalLength: number;
        get defaultTime(): number;
        set defaultTime(ct: number);
    }
    const PetManager: PetManager;

    interface PetStorage2015InfoManager {
        /**
         * @param {number} page 默认为0
         */
        getMiniInfo(callback: Callback, page?: number): void;
        getTotalInfo(callback: Callback): void;
        getInfoByType(arg1: number, arg2: number): PetStorage2015PetInfo[];
        changePetPosi(catchTime: number, location: number): void;
        allInfo: PetStorage2015PetInfo[];
    }
    const PetStorage2015InfoManager: PetStorage2015InfoManager;

    interface SystemTimerManager {
        queryTime(): void;
        sockettimeout(): void;
        time: number;
        sysBJDate: {
            getTime(): number;
        };
    }
    const SystemTimerManager: SystemTimerManager;

    interface CountermarkController {
        getInfo(obtainTime: number): CountermarkInfo;
        updateMnumberMark(markInfo: Pick<CountermarkInfo, 'markID' | 'catchTime'>): void;
        getAllUniversalMark(): Array<CountermarkInfo>;
    }
    const CountermarkController: CountermarkController;

    interface EffectIconControl {
        _hashMapByPetId: seerh5.HashMap<Array<{ Id: number }>>;
    }
    const EffectIconControl: EffectIconControl;

    interface AchieveXMLInfo {
        titleRules: seerh5.Dict<seerh5.TitleObj>;
        isAbilityTitle(id: number): boolean;
        getTitle(id: number): string;
        getTitleDesc(id: number): string;
        getTitleEffDesc(id: number): string;
    }
    const AchieveXMLInfo: AchieveXMLInfo;

    interface ItemXMLInfo {
        _itemDict: seerh5.Dict<seerh5.ItemObj>;
        getName(id: number): string;
        getItemObj(id: number): seerh5.ItemObj | undefined;
        getSkillStoneRank(id: number): number;
    }
    const ItemXMLInfo: ItemXMLInfo;

    interface ItemSeXMLInfo {
        getAllAbilitySuit(): string[];
        getIsEffSuit(id: number): boolean;
        getSuitEff(id: number): string;
        _equipDict: seerh5.HashMap<seerh5.EquipmentObj>;
    }
    const ItemSeXMLInfo: ItemSeXMLInfo;

    interface SkillXMLInfo {
        SKILL_OBJ: {
            Moves: { Move: Array<seerh5.MoveObj> };
            SideEffects: { SideEffect: Array<seerh5.SideEffectObj>; _text: Array<string> };
        };
        movesMap: seerh5.Dict<seerh5.MoveObj>;
        moveStoneMap: seerh5.Dict<seerh5.MoveObj>;
        hideMovesMap: Record<number, Array<{ o: number; id: number }>>;
        typeMap: seerh5.Dict<seerh5.ElementObj>;
        getName(id: number): string;
        getTypeID(id: number): number;
        getCategory(id: number): number;
        getCategoryName(id: number): string;
        getHideSkillId(petId: number): number;
        getSkillObj(id: number): seerh5.MoveObj | undefined;
        getStoneBySkill(id: number): number | undefined;
    }
    const SkillXMLInfo: SkillXMLInfo;

    interface SuitXMLInfo {
        _dataMap: seerh5.HashMap<seerh5.SuitObj>;
        getName(id: number): string;
        getIsElite(id: number): boolean;
        getSuitID(clothIds: number[]): number;
        getSuitIDs(clothIds: number[]): number[];
    }
    const SuitXMLInfo: SuitXMLInfo;

    interface PetXMLInfo {
        _dataMap: seerh5.Dict<seerh5.PetObj>;
        getType(id: number): number;
        getName(id: number): string;
    }
    const PetXMLInfo: PetXMLInfo;

    interface PetFragmentXMLInfo {
        getItemByID(id: number): seerh5.PetFragmentObj;
    }
    const PetFragmentXMLInfo: PetFragmentXMLInfo;

    interface TypeXMLInfo {
        getRelationsPow(a: string, b: string): number;
    }
    const TypeXMLInfo: TypeXMLInfo;

    interface PetUpdateCmdListener {
        onUpdateSkill(): void;
    }
    const PetUpdateCmdListener: PetUpdateCmdListener;
}

export {};
