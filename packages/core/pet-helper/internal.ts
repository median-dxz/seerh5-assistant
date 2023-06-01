import { SAEventTarget } from '../common/utils.js';
import { Hook } from '../constant/index.js';
import { SocketListener } from '../event-bus/index.js';
import { PetDataManger, ProxyPet } from './PetDataManager.js';

export default () => {
    SocketListener.subscribe(CommandID.GET_PET_INFO_BY_ONCE, (data) => {
        const bytes = new egret.ByteArray(data);
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

    SocketListener.subscribe(CommandID.GET_PET_INFO, (data) => {
        const bytes = new egret.ByteArray(data);
        return new ProxyPet(new PetInfo(bytes));
    });

    SocketListener.subscribe(CommandID.PET_DEFAULT);
    SocketListener.subscribe(CommandID.PET_RELEASE, (data) => {
        const bytes = new egret.ByteArray(data);
        return new PetTakeOutInfo(bytes);
    });

    SocketListener.subscribe(CommandID.ADD_LOVE_PET);
    SocketListener.subscribe(CommandID.DEL_LOVE_PET);
    SocketListener.subscribe(CommandID.PET_CURE);

    PetDataManger.init();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    PetDataManger.bag.deactivate = new Proxy(PetDataManger.bag.deactivate, {
        apply: (target, thisArg, argArray) => {
            SAEventTarget.emit(Hook.PetBag.deactivate);
            Reflect.apply(target, thisArg, argArray);
            return;
        },
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    PetDataManger.bag.update = new Proxy(PetDataManger.bag.update, {
        apply: (target, thisArg, argArray: [[ProxyPet[], ProxyPet[]]]) => {
            SAEventTarget.emit(Hook.PetBag.update, ...argArray);
            Reflect.apply(target, thisArg, argArray);
            return;
        },
    });
};
