import { HookRegistry, SocketDeserializerRegistry } from '../event-source/index.js';
import { PetDataManger } from './PetDataManager.js';
import { ProxyPet } from './SEAPet.js';

export default () => {
    SocketDeserializerRegistry.register(CommandID.GET_PET_INFO_BY_ONCE, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        let size = bytes.readUnsignedInt();
        const r1 = [];
        for (let i = 0; i < size; i++) {
            const pet = new ProxyPet(new PetInfo(bytes));
            r1.push(pet);
        }
        size = bytes.readUnsignedInt();
        const r2 = [];
        for (let i = 0; i < size; i++) {
            const pet = new ProxyPet(new PetInfo(bytes));
            r2.push(pet);
        }
        return [r1, r2] as const;
    });

    SocketDeserializerRegistry.register(CommandID.GET_PET_INFO, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new ProxyPet(new PetInfo(bytes));
    });

    SocketDeserializerRegistry.register(CommandID.PET_RELEASE, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new PetTakeOutInfo(bytes);
    });

    PetDataManger.init();

    HookRegistry.register('pet_bag:update', (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PetDataManger.bag.update = new Proxy(PetDataManger.bag.update, {
            apply: (target, thisArg, argArray: [[ProxyPet[], ProxyPet[]]]) => {
                resolve(...argArray);
                return Reflect.apply(target, thisArg, argArray);
            },
        });
    });

    HookRegistry.register('pet_bag:deactivate', (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PetDataManger.bag.deactivate = new Proxy(PetDataManger.bag.deactivate, {
            apply: (target, thisArg, argArray) => {
                resolve();
                return void Reflect.apply(target, thisArg, argArray);
            },
        });
    });
};
