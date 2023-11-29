import { CacheData, NOOP } from '../common/utils.js';
import { DataSource } from '../data-source/index.js';
import { Socket } from '../engine/index.js';
import { EntityBase } from '../entity/EntityBase.js';
import type { Item } from '../entity/index.js';
import { Pet } from '../entity/index.js';

import { PetLocation, setLocationTable } from './PetLocation.js';

export type CatchTime = number;

class PetDataManager {
    private readonly CacheSize = 50;
    private cacheTimestamp = new Map<CatchTime, number>();
    private hasInit = false;

    private queryQueue = new Map<CatchTime, Array<(value: ProxyPet) => void>>();

    defaultCt: CatchTime = -1;
    bag: CacheData<[ProxyPet[], ProxyPet[]]> = new CacheData([[], []], NOOP);
    miniInfo: CacheData<Map<CatchTime, PetStorage2015PetInfo>> = new CacheData(
        new Map<CatchTime, PetStorage2015PetInfo>(),
        NOOP
    );

    cache = new Map<CatchTime, ProxyPet>();

    init() {
        if (!this.hasInit) {
            DataSource.socket(CommandID.GET_PET_INFO_BY_ONCE, 'receive').on((pets) => {
                this.bag.update([...pets]);
                pets[0].concat(pets[1]).forEach((pet) => {
                    this.cachePet(pet);
                });
            });

            DataSource.socket(CommandID.GET_PET_INFO, 'receive').on((pet) => {
                this.cachePet(pet);
                this.bag.deactivate();
            });

            DataSource.socket(CommandID.PET_DEFAULT, 'send').on((bytes) => {
                this.defaultCt = bytes[0] as number;
                this.bag.deactivate();
            });

            DataSource.socket(CommandID.ADD_LOVE_PET, 'receive').on(() => {
                this.miniInfo.deactivate();
            });

            DataSource.socket(CommandID.DEL_LOVE_PET, 'receive').on(() => {
                this.miniInfo.deactivate();
            });

            DataSource.socket(CommandID.PET_CURE, 'receive').on(() => {
                this.bag.deactivate();
            });

            DataSource.socket(CommandID.PET_RELEASE, 'send').on((bytes) => {
                const [ct, _opt] = bytes as [number, number];
                this.cache.delete(ct);
                this.miniInfo.deactivate();
                this.bag.deactivate();
            });

            DataSource.socket(CommandID.PET_RELEASE, 'receive').on((data) => {
                // flag: 为假代表从背包移仓库, 仅此而已
                PetManager._setDefault(data.firstPetTime);
                this.defaultCt = data.firstPetTime;
            });

            this.bag = new CacheData(
                [PetManager.infos.map((p) => new ProxyPet(p)), PetManager.secondInfos.map((p) => new ProxyPet(p))],
                () => PetManager.updateBagInfo()
            );

            const updateMiniInfo = () =>
                PetStorage2015InfoManager.getMiniInfo(() => {
                    const info = new Map<number, PetStorage2015PetInfo>();
                    PetStorage2015InfoManager.allInfo.forEach((i) => info.set(i.catchTime, i));
                    this.miniInfo.update(info);
                });

            this.miniInfo = new CacheData<Map<number, PetStorage2015PetInfo>>(new Map(), updateMiniInfo);

            updateMiniInfo();

            this.defaultCt = PetManager.defaultTime;
        }
        this.hasInit = true;
    }

    cachePet(pet: ProxyPet) {
        this.cache.set(pet.catchTime, pet);
        this.cacheTimestamp.set(pet.catchTime, Date.now());

        if (this.cache.size > this.CacheSize) {
            const [ct, _] = Array.from(this.cacheTimestamp.entries())
                .sort((a, b) => a[1] - b[1])
                .find(
                    ([ct, _]) =>
                        !this.bag
                            .getImmediate()
                            .flat()
                            .some((pet) => pet.catchTime === ct)
                )!;

            this.cache.delete(ct);
            this.cacheTimestamp.delete(ct);
        }

        if (this.queryQueue.has(pet.catchTime)) {
            const resolvers = this.queryQueue.get(pet.catchTime)!;
            resolvers.forEach((resolver) => resolver(pet));
            this.queryQueue.delete(pet.catchTime);
        }
    }

    query(ct: CatchTime) {
        this.bag.deactivate();
        this.cache.delete(ct);
        this.cacheTimestamp.delete(ct);

        if (!this.queryQueue.has(ct)) {
            this.queryQueue.set(ct, []);
            void Socket.sendByQueue(CommandID.GET_PET_INFO, [ct]);
        }

        return new Promise<ProxyPet>((resolve) => {
            this.queryQueue.get(ct)!.push(resolve);
        });
    }
}

const ins = new PetDataManager();

export { ins as PetDataManger };

export class ProxyPet extends Pet {
    constructor(i: PetInfo) {
        super(i);
    }

    get isDefault(): boolean {
        return this.catchTime === ins.defaultCt;
    }

    default() {
        return this.setLocation(PetLocation.Default);
    }

    async location(): Promise<PetLocation> {
        const allInfo = await ins.miniInfo.get();
        const bagPet = await ins.bag.get();
        if (this.catchTime === ins.defaultCt && bagPet[0].length > 0) {
            return PetLocation.Default;
        }
        if (bagPet[0].find((pet) => pet.catchTime === this.catchTime)) {
            return PetLocation.Bag;
        }
        if (bagPet[1].find((pet) => pet.catchTime === this.catchTime)) {
            return PetLocation.SecondBag;
        }
        if (allInfo.has(this.catchTime)) {
            const pet = allInfo.get(this.catchTime)!;
            let pos = PetLocation.Unknown;
            switch (pet.posi) {
                case 0:
                    pos = PetLocation.Storage;
                    break;
                case 4:
                    pos = PetLocation.Elite;
                    break;
                case 14:
                    pos = PetLocation.OnDispatching;
                    break;
                default:
            }
            return pos;
        }
        return PetLocation.Unknown;
    }

    async setLocation(newLocation: PetLocation) {
        const oldLocation = await this.location();
        if (newLocation === oldLocation) {
            return false;
        }
        const r = await setLocationTable[oldLocation][newLocation]?.(this.catchTime);
        return r ?? false;
    }

    async cure() {
        await Socket.sendByQueue(CommandID.PET_ONE_CURE, [this.catchTime]);
        return ins.query(this.catchTime);
    }

    async popFromBag() {
        const local = await this.location();
        if (local === PetLocation.Bag || local === PetLocation.SecondBag || local === PetLocation.Default) {
            await this.setLocation(PetLocation.Storage);
        }
        return;
    }

    /**
     * @description 对精灵使用物品
     * Attention: 该发包不具备收包resolve的条件! 请手动添加延迟
     */
    async useItem(item: Item | number) {
        const itemId = EntityBase.inferId(item);
        const info = await PetManager.UpdateBagPetInfoAsynce(this.catchTime);
        ItemUseManager.getInstance().useItem(info, itemId);
        return ins.query(this.catchTime);
    }

    /**
     * @description 对精灵使用药品
     */
    async usePotion(potion: Item | number) {
        const itemId = EntityBase.inferId(potion);
        await Socket.sendByQueue(CommandID.USE_PET_ITEM_OUT_OF_FIGHT, [this.catchTime, itemId]);
        return ins.query(this.catchTime);
    }
}
