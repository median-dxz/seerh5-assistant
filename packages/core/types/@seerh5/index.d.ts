/// <reference path="battle.d.ts" />
/// <reference path="core.d.ts" />
/// <reference path="common.d.ts" />
/// <reference path="popViewManager.d.ts" />
/// <reference path="socket.d.ts" />

/// <reference path="modules/battleResultPanel.d.ts" />
/// <reference path="modules/itemWarehouse.d.ts" />
/// <reference path="modules/mainPanel.d.ts" />
/// <reference path="modules/petBag.d.ts" />
/// <reference path="modules/petNewSkillPanel.d.ts" />
/// <reference path="modules/team.d.ts" />

declare global {
    namespace seerh5 {
        type Dict<T extends object> = Record<string | number, T>;
        type Callback<T = unknown> = (this: T, ...args: any[]) => void;
        type EventHandler<E extends egret.EventDispatcher> = (event?: E) => void;

        class HashMap<T extends object> {
            containsKey(key: any): boolean;
            getValue(key: any): T | undefined;
            getValues(): Array<T>;
            private _length: number;
            private _content: seerh5.Dict<T>;
            get length(): number;
        }

        interface BaseObj {
            [property: string]: string | number | unknown | undefined;
        }

        interface PetObj extends BaseObj {
            ID: number;
            DefName: string;
            Type: number;
        }

        type PetLike = PetInfo | PetStorage2015PetInfo | PetObj | PetListInfo;

        interface MoveObj extends BaseObj {
            ID: number;
            Name: string;
            Accuracy: number;
            Category: number;
            MaxPP: number;
            Type: number;
            pp?: number;
            Power?: number;
            MustHit?: number;
            Priority?: number;
            SideEffect?: string;
            SideEffectArg?: string;
        }

        interface ItemObj extends BaseObj {
            ID: number;
            Name: string;
            Bean?: number;
            DailyKey?: number;
            DailyOutMax?: number;
            Hide?: number;
            LifeTime?: number;
            Price?: number;
            Sort?: number;
            Tradability: number;
            VipTradability: number;
            wd: number;
            Max?: number;
            UseMax?: number;
            purpose?: number;
            NewSeIdx?: number;
        }

        interface ElementObj extends BaseObj {
            cn: string;
            en: string;
            id: number;
            att?: string;
            is_dou?: number;
        }

        interface StatusEffectObj extends BaseObj {
            ID: number;
            Name: string;
            Efftype: 0 | 1;
        }

        interface PetFragmentLevelBoss extends BaseObj {
            ID: number;
            BattleBoss: number;
            BossID: number;
            Desc: string;
        }

        interface PetFragmentLevelObj extends BaseObj {
            ID: number;
            Desc: string;
            Configure: {
                Times: number;
                TimeValue: number;
                FailTimes: number;
                ProgressValue: number;
            };
            EasyBattle: { Task: PetFragmentLevelBoss[] };
            NormalBattle: { Task: PetFragmentLevelBoss[] };
            HardBattle: { Task: PetFragmentLevelBoss[] };
            Reward: {
                ItemID: number;
            };
        }

        interface SuitObj extends BaseObj {
            cloths: string;
            id: number;
            name: string;
            Desc: string;
            suitdes: string;
        }

        interface AchieveObj extends BaseObj {
            ID: number;
            Desc: string;
        }

        interface TitleObj extends AchieveObj {
            SpeNameBonus: number;
            title: string;
            abtext?: string;
        }

        interface SideEffectObj extends BaseObj {}

        interface EquipmentObj extends BaseObj {
            ID: number;
            ItemID: number;
            Name: string;
            Part: number;
            Quality: number;
            Occasion: number;
            Target: number;
            Desc: string;
            SuitID?: number;
            SuitNewseId?: number;
        }

        interface ObserverList<T> {
            array: Array<T>;
        }

        type SocketRequestData = (egret.ByteArray | number)[];
    }

    const CommandID: {
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

        SETTITLE: 3404;

        GET_PET_INFO_BY_ONCE: 43706;
    };

    namespace RES {
        function getVirtualUrl(url: string): string;
        function getResByUrl(url: string): Promise<egret.HashObject>;
    }

    interface AppDoStyle {
        '0': 'DESTROY';
        '1': 'HIDEN';
        '2': 'NULL';
        DESTROY: 0;
        HIDEN: 1;
        NULL: 2;
    }
    const AppDoStyle: AppDoStyle;

    var EventManager: egret.EventDispatcher;
    var Core: any;
    var config: {
        xml: any;
        Brave_lv: any;
    };
    var SeerVersionController: {
        getVersionUrl(url: string): string;
    };
    var GameInfo: {
        token_url: string;
        online_gate: string;
    };

    class WebSoundManager {
        loadSound(url: string): Promise<void>;
        loadFightMusic(url: string): Promise<void>;
    }

    class OnlineManager {
        setSentryScope: () => void;
    }

    class SocketEvent extends egret.Event {
        data: egret.ByteArray | undefined;
    }

    class SocketErrorEvent extends egret.Event {}

    class PetEvent extends egret.Event {
        static readonly EQUIP_SKIN: string;
        constructor(type: string, catchTime: number, obj: any);
    }

    class PetFightEvent extends egret.Event {
        static readonly ALARM_CLICK: 'fight_alarmClick';
        static readonly ON_USE_PET_ITEM: 'onUsePetItem';
        static readonly CHANGE_PET: 'changePet';
        constructor(type: string, obj?: any);
    }

    class UserInfoEvent extends egret.Event {
        static readonly EVENT_CHANGE_TITLE: 'event_change_title';
        static readonly EVENT_CHANGE_CLOTHERS: 'event_change_clothers';
    }
}

export {};
