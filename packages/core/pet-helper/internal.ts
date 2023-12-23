import { HookPointRegistry, SocketDeserializerRegistry } from '../internal/index.js';
import { CaughtPet } from './pet.js';
import { SEAPetStore } from './PetStore.js';

export default () => {
    SocketDeserializerRegistry.register(CommandID.GET_PET_INFO_BY_ONCE, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        let size = bytes.readUnsignedInt();
        const r1 = [];
        for (let i = 0; i < size; i++) {
            const pet = new CaughtPet(new PetInfo(bytes));
            r1.push(pet);
        }
        size = bytes.readUnsignedInt();
        const r2 = [];
        for (let i = 0; i < size; i++) {
            const pet = new CaughtPet(new PetInfo(bytes));
            r2.push(pet);
        }
        return [r1, r2] as const;
    });

    SocketDeserializerRegistry.register(CommandID.GET_PET_INFO, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new CaughtPet(new PetInfo(bytes));
    });

    SocketDeserializerRegistry.register(CommandID.PET_RELEASE, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new PetTakeOutInfo(bytes);
    });

    SEAPetStore.init();

    HookPointRegistry.register('pet_bag:update', (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        SEAPetStore.bag.update = new Proxy(SEAPetStore.bag.update, {
            apply: (target, thisArg, argArray: [[CaughtPet[], CaughtPet[]]]) => {
                resolve(...argArray);
                return Reflect.apply(target, thisArg, argArray);
            },
        });
    });

    HookPointRegistry.register('pet_bag:deactivate', (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        SEAPetStore.bag.deactivate = new Proxy(SEAPetStore.bag.deactivate, {
            apply: (target, thisArg, argArray) => {
                resolve();
                return void Reflect.apply(target, thisArg, argArray);
            },
        });
    });
};
