/// <reference types="@sea/core/types/seerh5" />
/// <reference types="@sea/core/types/egret" />
/// <reference types="@sea/core" />

declare global {
    class NatureXMLInfo {
        static _dataMap: seerh5.Dict<seerh5.NatureObj>;
    }
}

declare module '@sea/core' {
    export interface SEAEngine {
        battleFireInfo: () => Promise<{
            type: number;
            valid: boolean;
            timeLeft: number;
        }>;

        /**
         * @param type 装备类型, 代表装备的位置(目镜, 头部, 腰部等)
         * @param itemId 装备的**物品**id
         */
        changeEquipment: (type: Parameters<UserInfo['requestChangeClothes']>[0], itemId: number) => Promise<void>;
    }

    export interface GameConfigMap {
        nature: seerh5.NatureObj;
    }
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace seerh5 {
        interface NatureObj extends seerh5.BaseObj {
            id: number;
            name: string;
        }
    }

    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
    }
}

export {};
