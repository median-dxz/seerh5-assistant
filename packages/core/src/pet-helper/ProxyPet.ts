import { SAEventTarget, extractObjectId } from '../common';
import { CacheData } from '../common/CacheData';
import { Hook } from '../constant/event-hooks';
import { Socket } from '../engine';
import { Item } from '../entity/Item';
import { Pet } from '../entity/Pet';
import { SocketListener } from '../event-bus/socket';
import { SAPetLocation, setLocationTable } from './PetLocation';

type CatchTime = number;

class DataManager {
    private readonly CacheSize = 50;
    private cacheTimestamp = new Map<CatchTime, number>();
    private hasInit = false;

    private queryQueue = new Map<CatchTime, (value: ProxyPet) => void>();

    defaultCt: CatchTime;
    bag: CacheData<[ProxyPet[], ProxyPet[]]>;
    miniInfo: CacheData<Map<CatchTime, PetStorage2015PetInfo>>;

    cache = new Map<CatchTime, ProxyPet>();

    init() {
        if (!this.hasInit) {
            SocketListener.on({
                cmd: CommandID.GET_PET_INFO_BY_ONCE,
                res: (pets) => {
                    this.bag.update([...pets]);
                    pets[0].concat(pets[1]).forEach((pet) => {
                        this.cachePet(pet);
                    });
                },
            });

            SocketListener.on({
                cmd: CommandID.GET_PET_INFO,
                res: (pet) => {
                    this.cachePet(pet);
                    this.bag.deactivate();
                },
            });

            SocketListener.on({
                cmd: CommandID.PET_DEFAULT,
                req: (bytes) => {
                    this.defaultCt = bytes[0] as number;
                    this.bag.deactivate();
                },
            });

            SocketListener.on({
                cmd: CommandID.ADD_LOVE_PET,
                req: () => this.miniInfo.deactivate(),
            });

            SocketListener.on({
                cmd: CommandID.DEL_LOVE_PET,
                req: () => {
                    this.miniInfo.deactivate();
                },
            });

            SocketListener.on({
                cmd: CommandID.PET_CURE,
                res: () => {
                    this.bag.deactivate();
                },
            });

            SocketListener.on({
                cmd: CommandID.PET_RELEASE,
                req: () => {
                    this.miniInfo.deactivate();
                    this.bag.deactivate();
                },
                res: (data) => {
                    PetManager.setDefault(data.firstPetTime);
                },
            });

            this.bag = new CacheData(
                [PetManager.infos.map((p) => new ProxyPet(p)), PetManager.secondInfos.map((p) => new ProxyPet(p))],
                () => PetManager.updateBagInfo()
            );

            const miniInfo = () => {
                const data = new Map<CatchTime, PetStorage2015PetInfo>();
                PetStorage2015InfoManager.allInfo.forEach((i) => data.set(i.catchTime, i));
                return data;
            };

            this.miniInfo = new CacheData(miniInfo(), () => {
                PetStorage2015InfoManager.allInfo = [];
                PetStorage2015InfoManager.getMiniInfo(() => {
                    this.miniInfo.update(miniInfo());
                });
            });

            this.defaultCt = PetManager.defaultTime;

            this.bag.deactivate = new Proxy(this.bag.deactivate, {
                apply: (target, thisArg, argArray) => {
                    SAEventTarget.emit(Hook.PetBag.deactivate);
                    return Reflect.apply(target, thisArg, argArray);
                },
            });

            this.bag.update = new Proxy(this.bag.update, {
                apply: (target, thisArg, argArray) => {
                    SAEventTarget.emit(Hook.PetBag.update);
                    return Reflect.apply(target, thisArg, argArray);
                },
            });
        }
        this.hasInit = true;
    }

    cachePet(pet: ProxyPet) {
        this.cache.set(pet.catchTime, pet);
        this.cacheTimestamp.set(pet.catchTime, Date.now());

        if (this.cache.size > this.CacheSize) {
            let oldestCt: CatchTime = -1;
            let oldestTimestamp: number = Infinity;

            for (const [k, v] of this.cacheTimestamp.entries()) {
                if (v < oldestTimestamp) {
                    [oldestCt, oldestTimestamp] = [k, v];
                }
            }

            this.cache.delete(oldestCt);
            this.cacheTimestamp.delete(oldestCt);
        }

        if (this.queryQueue.has(pet.catchTime)) {
            const resolver = this.queryQueue.get(pet.catchTime)!;
            this.queryQueue.delete(pet.catchTime);
            resolver(pet);
        }
    }

    async query(ct: CatchTime) {
        this.bag.deactivate();
        this.cache.delete(ct);
        return new Promise<ProxyPet>((resolve) => {
            this.queryQueue.set(ct, resolve);
            Socket.sendByQueue(CommandID.GET_PET_INFO, ct);
        });
    }
}

export class ProxyPet extends Pet {
    constructor(i: PetInfo) {
        super(i);
    }

    get pet(): Pet {
        return this;
    }

    get isDefault(): boolean {
        return this.catchTime === ins.defaultCt;
    }

    default() {
        return this.setLocation(SAPetLocation.Default);
    }

    async location(): Promise<SAPetLocation> {
        const allInfo = await ins.miniInfo.get();
        const bagPet = await ins.bag.get();
        if (this.catchTime === ins.defaultCt) {
            return SAPetLocation.Default;
        }
        if (bagPet[0].find((pet) => pet.catchTime === this.catchTime)) {
            return SAPetLocation.Bag;
        }
        if (bagPet[1].find((pet) => pet.catchTime === this.catchTime)) {
            return SAPetLocation.SecondBag;
        }
        if (allInfo.has(this.catchTime)) {
            const pet = allInfo.get(this.catchTime)!;
            let pos = SAPetLocation.Unknown;
            switch (pet.posi) {
                case 0:
                    pos = SAPetLocation.Storage;
                    break;
                case 4:
                    pos = SAPetLocation.Elite;
                    break;
                case 14:
                    pos = SAPetLocation.OnDispatching;
                    break;
                default:
            }
            return pos;
        }
        return SAPetLocation.Unknown;
    }

    async setLocation(newLocation: SAPetLocation) {
        const oldLocation = await this.location();
        if (newLocation === oldLocation) {
            return false;
        }
        const r = await setLocationTable[oldLocation][newLocation]?.(this.catchTime);
        return r ?? false;
    }

    async cure() {
        Socket.sendByQueue(CommandID.PET_ONE_CURE, this.catchTime);
        return ins.query(this.catchTime);
    }

    async popFromBag() {
        const local = await this.location();
        if (local === SAPetLocation.Bag || local === SAPetLocation.SecondBag || local === SAPetLocation.Default) {
            await this.setLocation(SAPetLocation.Storage);
        }
        return ins.query(this.catchTime);
    }

    /**
     * @description 对精灵使用物品
     * Attention: 该发包不具备收包resolve的条件! 请手动添加延迟
     */
    async useItem(item: Item | number) {
        const itemId = extractObjectId(item, Item.instanceKey);
        const info = await PetManager.UpdateBagPetInfoAsynce(this.catchTime);
        ItemUseManager.getInstance().useItem(info, itemId);
        return ins.query(this.catchTime);
    }

    /**
     * @description 对精灵使用药品
     */
    async usePotion(item: Item | number) {
        const itemId = extractObjectId(item, Item.instanceKey);
        await Socket.sendByQueue(CommandID.USE_PET_ITEM_OUT_OF_FIGHT, [this.catchTime, itemId]);
        return ins.query(this.catchTime);
    }
}

const ins = new DataManager();

export function SAPet(pet: CatchTime | Pet) {
    const ct = extractObjectId(pet, Pet.instanceKey);
    if (ins.cache.has(ct)) {
        return ins.cache.get(ct)!;
    } else {
        const pet = new Proxy({} as ProxyPet, {
            get(target, key, receiver) {
                const prop = key as keyof ProxyPet;
                if (typeof ProxyPet.prototype[prop] === 'function') {
                    return async (...args: unknown[]) => {
                        return ins.query(ct).then((pet) => (pet[prop] as Function).apply(pet, args));
                    };
                } else {
                    return ins.query(ct).then((pet) => pet[prop]);
                }
            },
        });
        return pet;
    }
}

export { ins as PetDataManger };

