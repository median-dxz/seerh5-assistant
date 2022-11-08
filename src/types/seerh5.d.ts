declare namespace SAType {
    type EventHandler<E extends EgretEventTarget> = (event?: E) => void;

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

    interface SideEffectObj extends BaseObj {}

    interface IObserverList<T> {
        array: Array<T>;
    }
}

interface EgretEventTarget extends EventTarget {
    dispatchEventWith: Function;
}

declare var EventManager: EgretEventTarget;

//common

declare namespace egret {
    const TouchEvent: any;
    const lifecycle: any;
    class ByteArray {
        data: DataView;
    }
}

// saloader

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

// init/helper
declare var Alarm: any;
declare var BubblerManager: any;

// init/socket
declare var SocketEncryptImpl: any;

// utils/sa-utils
declare var KTool: any;
declare var CountermarkEvent: any;
declare var PetStatusEffectConfig: any;

// entities

declare type ItemInfo = {
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
};

declare var EffectInfoManager: any;

// pet-helper
declare var TypeXMLInfo: any;

// battle-module
declare var TimerManager: any;

// mods
declare var SystemTimerManager: any;
declare var MainManager: any;
declare var markCenter: any;
declare var FightPetInfo: any;
declare var PetSkinController: any;
declare var PetSkinXMLInfo: any;
declare var ClientConfig: any;
declare interface PetEvent {
    new (e: string, oi: number, ni: number): PetEvent;
    [EventType: string]: string;
}
declare var PetEvent: PetEvent;
declare var PetFightSkinSkillReplaceXMLInfo: any;
declare var PetIdTransform: any;
