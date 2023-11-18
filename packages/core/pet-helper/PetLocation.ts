import { PetPosition } from '../constant/index.js';
import { Socket } from '../engine/index.js';

export enum SEAPetLocation {
    Default = 'Default',
    Bag = 'Bag',
    SecondBag = 'SecondBag',
    Unknown = 'Unknown',
    Storage = 'Storage',
    Elite = 'Elite',
    OnDispatching = 'OnDispatching',
}

export const setLocationTable: {
    [loc in keyof typeof SEAPetLocation]: { [loc in keyof typeof SEAPetLocation]?: (ct: number) => Promise<boolean> };
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
            await Socket.sendWithReceivedPromise(CommandID.PET_DEFAULT, () => PetManager.setDefault(ct));
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
                .then(() => Socket.sendWithReceivedPromise(CommandID.PET_DEFAULT, () => PetManager.setDefault(ct)))
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
                .then(() => Socket.sendWithReceivedPromise(CommandID.PET_DEFAULT, () => PetManager.setDefault(ct)))
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
            await Socket.sendWithReceivedPromise(CommandID.DEL_LOVE_PET, () => PetManager.delLovePet(0, ct, 0));
            return true;
        },
    },
    Storage: {
        async Default(ct) {
            if (PetManager.isBagFull) return false;
            return new Promise((res) => {
                PetManager.storageToBag(ct, res);
            })
                .then(() => Socket.sendWithReceivedPromise(CommandID.PET_DEFAULT, () => PetManager.setDefault(ct)))
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
            await Socket.sendWithReceivedPromise(CommandID.ADD_LOVE_PET, () => PetManager.addLovePet(0, ct, 0));
            PetStorage2015InfoManager.changePetPosi(ct, PetPosition.elite);
            return true;
        },
    },
    Unknown: {},
    OnDispatching: {},
};
