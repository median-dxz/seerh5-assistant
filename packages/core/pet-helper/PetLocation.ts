import { PetPosition } from '../constant/index.js';
import { Socket } from '../engine/index.js';

export enum PetLocation {
    Default = 'Default',
    Bag = 'Bag',
    SecondBag = 'SecondBag',
    Unknown = 'Unknown',
    Storage = 'Storage',
    Elite = 'Elite',
    OnDispatching = 'OnDispatching',
}

export const setLocationTable: {
    [loc in keyof typeof PetLocation]: { [loc in keyof typeof PetLocation]?: (ct: number) => Promise<boolean> };
} = {
    Default: {
        async SecondBag(ct) {
            if (PetManager.isSecondBagFull) return false;
            return PetManager.bagToSecondBag(ct).then(() => true);
        },
        async Storage(ct) {
            return PetManager.bagToStorage(ct).then(() => true);
        },
        async Elite(ct) {
            return PetManager.bagToStorage(ct).then(() => true);
        },
    },
    Bag: {
        async Default(ct) {
            await PetManager.setDefault(ct);
            return true;
        },
        async SecondBag(ct) {
            if (PetManager.isSecondBagFull) return false;
            return PetManager.bagToSecondBag(ct).then(() => true);
        },
        async Storage(ct) {
            return PetManager.bagToStorage(ct).then(() => true);
        },
        async Elite(ct) {
            return PetManager.bagToStorage(ct).then(() => true);
        },
    },
    SecondBag: {
        async Default(ct) {
            if (PetManager.isBagFull) return false;
            return PetManager.secondBagToBag(ct)
                .then(() => PetManager.setDefault(ct))
                .then(() => true);
        },
        async Bag(ct) {
            if (PetManager.isBagFull) return false;
            return PetManager.secondBagToBag(ct).then(() => true);
        },
        async Storage(ct) {
            return PetManager.secondBagToStorage(ct).then(() => true);
        },
        async Elite(ct) {
            return PetManager.secondBagToStorage(ct).then(() => true);
        },
    },
    Elite: {
        async Default(ct) {
            if (PetManager.isBagFull) return false;
            return PetManager.loveToBag(ct)
                .then(() => PetManager.setDefault(ct))
                .then(() => true);
        },
        async Bag(ct) {
            if (PetManager.isBagFull) return false;
            return PetManager.loveToBag(ct).then(() => true);
        },
        async SecondBag(ct) {
            if (PetManager.isSecondBagFull) return false;
            return PetManager.storageToSecondBag(ct).then(() => true);
        },
        async Storage(ct) {
            PetManager.curRetrieveLovePetInfo = {
                catchTime: ct,
            } as PetListInfo;

            await Socket.sendByQueue(CommandID.DEL_LOVE_PET, [ct]).then(() => {
                PetManager.onDelLovePetSuccessHandler(ct);
                PetStorage2015InfoManager.changePetPosi(ct, PetPosition.elite);
            });
            return true;
        },
    },
    Storage: {
        async Default(ct) {
            if (PetManager.isBagFull) return false;
            return new Promise((res) => {
                PetManager.storageToBag(ct, res);
            })
                .then(() => PetManager.setDefault(ct))
                .then(() => true);
        },
        async Bag(ct) {
            if (PetManager.isBagFull) return false;
            return new Promise((res) => {
                PetManager.storageToBag(ct, res);
            }).then(() => true);
        },
        async SecondBag(ct) {
            if (PetManager.isSecondBagFull) return false;
            return PetManager.storageToSecondBag(ct).then(() => true);
        },
        async Elite(ct) {
            PetManager.curLovePetInfo = {
                catchTime: ct,
            } as PetListInfo;

            await Socket.sendByQueue(CommandID.ADD_LOVE_PET, [ct]).then(() => {
                PetManager.onAddLovePetSuccessHandler(ct);
                PetStorage2015InfoManager.changePetPosi(ct, PetPosition.elite);
            });
            return true;
        },
    },
    Unknown: {},
    OnDispatching: {},
};
