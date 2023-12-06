import { CacheData, NOOP } from '../common/utils.js';
import { Socket } from '../engine/index.js';
import { SEAEventSource } from '../event-source/index.js';
import { ProxyPet } from './SEAPet.js';

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
            SEAEventSource.socket(CommandID.GET_PET_INFO_BY_ONCE, 'receive').on((pets) => {
                this.bag.update([...pets]);
                pets[0].concat(pets[1]).forEach((pet) => {
                    this.cachePet(pet);
                });
            });

            SEAEventSource.socket(CommandID.GET_PET_INFO, 'receive').on((pet) => {
                this.cachePet(pet);
                this.bag.deactivate();
            });

            SEAEventSource.socket(CommandID.PET_DEFAULT, 'send').on((bytes) => {
                this.defaultCt = bytes[0] as number;
                this.bag.deactivate();
            });

            SEAEventSource.socket(CommandID.ADD_LOVE_PET, 'receive').on(() => {
                this.miniInfo.deactivate();
            });

            SEAEventSource.socket(CommandID.DEL_LOVE_PET, 'receive').on(() => {
                this.miniInfo.deactivate();
            });

            SEAEventSource.socket(CommandID.PET_CURE, 'receive').on(() => {
                this.bag.deactivate();
            });

            SEAEventSource.socket(CommandID.PET_RELEASE).on(([req, res]) => {
                const [ct, opt] = req as [number, number];
                const { firstPetTime } = res;

                if (this.miniInfo.getImmediate().has(ct) || opt == 3 || opt == 0) {
                    this.miniInfo.deactivate();
                }

                this.bag.deactivate();
                PetManager._setDefault(firstPetTime);
                this.defaultCt = firstPetTime;
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

