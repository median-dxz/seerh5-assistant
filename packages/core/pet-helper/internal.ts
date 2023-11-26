import { Hook } from '../constant/index.js';
import { HookRegistry, SocketBuilderRegistry } from '../data-source/index.js';
import { PetDataManger, ProxyPet } from './PetDataManager.js';

export default () => {
    SocketBuilderRegistry.register(CommandID.GET_PET_INFO_BY_ONCE, (data) => {
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

    SocketBuilderRegistry.register(CommandID.GET_PET_INFO, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new ProxyPet(new PetInfo(bytes));
    });

    // SocketBuilderRegistry.register(CommandID.PET_DEFAULT);
    SocketBuilderRegistry.register(CommandID.PET_RELEASE, (data) => {
        const bytes = new egret.ByteArray(data!.rawBuffer);
        return new PetTakeOutInfo(bytes);
    });

    // SocketBuilderRegistry.register(CommandID.ADD_LOVE_PET);
    // SocketBuilderRegistry.register(CommandID.DEL_LOVE_PET);
    // SocketBuilderRegistry.register(CommandID.PET_CURE);

    PetDataManger.init();

    HookRegistry.register(Hook.PetBag.update, (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PetDataManger.bag.update = new Proxy(PetDataManger.bag.update, {
            apply: (target, thisArg, argArray: [[ProxyPet[], ProxyPet[]]]) => {
                resolve(...argArray);
                return Reflect.apply(target, thisArg, argArray);
            },
        });
    });

    HookRegistry.register(Hook.PetBag.deactivate, (resolve) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PetDataManger.bag.deactivate = new Proxy(PetDataManger.bag.deactivate, {
            apply: (target, thisArg, argArray) => {
                resolve();
                return void Reflect.apply(target, thisArg, argArray);
            },
        });
    });
};
