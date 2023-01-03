declare namespace SAType {
    type EventHandler<E extends egret.EventDispatcher> = (event?: E) => void;

    type Dict<T extends object> = {
        [property: number | string]: T;
    };

    class HashMap<T extends object> {
        containsKey(key: any): boolean;
        getValues(): Array<T>;
        private _length: number;
        private _content: Dict<T>;
        get length(): number;
    }

    type PetLike = PetInfo & PetStorage2015PetInfo;

    interface BaseObj {
        [property: string]: string | number | unknown | undefined;
        ID: number;
    }

    interface ItemObj extends BaseObj {}

    interface PetObj extends BaseObj {
        DefName: string;
        Type: number;
    }

    interface MoveObj extends BaseObj {
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

    interface SideEffectObj extends BaseObj {}

    interface ObserverList<T> {
        array: Array<T>;
    }
}

declare namespace RES {
    function getResByUrl(url: string): Promise<egret.Texture>;
}

declare interface AppDoStyle {
    '0': 'DESTROY';
    '1': 'HIDEN';
    '2': 'NULL';
    DESTROY: 0;
    HIDEN: 1;
    NULL: 2;
}

declare const AppDoStyle: AppDoStyle;

//common
declare var EventManager: egret.EventDispatcher;

// sa-loader
declare var OnlineManager: any;

// init/event
declare var AwardManager: any;
declare var LevelManager: any;
declare var PetUpdatePropController: any;

// init/helper
declare var Alarm: any;
declare var Alert: any;

// utils/sa-utils
declare var CountermarkEvent: any;
declare var PetStatusEffectConfig: any;

// entities
declare var EffectInfoManager: any;

// pet-helper
declare var TypeXMLInfo: any;

// mods
declare var SystemTimerManager: any;
declare var markCenter: any;
declare var PetSkinController: any;
declare var PetSkinXMLInfo: any;
declare var ClientConfig: any;

declare var PetFightSkinSkillReplaceXMLInfo: any;
declare var PetIdTransform: any;

declare class SocketEvent extends egret.Event {}
declare class PetEvent extends egret.Event {
    static readonly EQUIP_SKIN: string;
    constructor(type: string, catchTime: number, obj: any);
}

declare namespace baseMenuComponent {
    class BaseMenuComponent {
        selectedValue: any;
    }
}
