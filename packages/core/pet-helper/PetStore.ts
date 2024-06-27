import { CacheData } from '../common/CacheData.js';
import { NOOP } from '../common/utils.js';
import { SEAEventSource } from '../event-source/index.js';
import { socket } from '../internal/index.js';
import { PetLocation } from './PetLocation.js';
import { CaughtPet } from './pet.js';

export type CatchTime = number;

class SEAPetStore {
    private readonly CacheSize = 200;
    private cacheTimestamp = new Map<CatchTime, number>();
    private hasInit = false;

    private queryQueue = new Map<CatchTime, Array<(value: CaughtPet) => void>>();

    defaultCt: CatchTime = -1;
    bag = new CacheData<[CaughtPet[], CaughtPet[]]>([[], []], NOOP);
    miniInfo = new CacheData<Map<CatchTime, PetStorage2015PetInfo>>(new Map<CatchTime, PetStorage2015PetInfo>(), NOOP);

    cache = new Map<CatchTime, CaughtPet>();

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

            SEAEventSource.socket(CommandID.PET_ONE_CURE, 'receive').on(() => {
                this.bag.deactivate();
            });

            SEAEventSource.socket(CommandID.USE_PET_ITEM_OUT_OF_FIGHT, 'send').on(() => {
                this.bag.deactivate();
            });

            SEAEventSource.socket(42019, 'send').on((data) => {
                if (Array.isArray(data) && data.length === 2 && data[0] === 22439) {
                    this.bag.deactivate();
                }
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
                [PetManager.infos.map((p) => new CaughtPet(p)), PetManager.secondInfos.map((p) => new CaughtPet(p))],
                () => {
                    PetManager.updateBagInfo();
                }
            );

            const updateMiniInfo = () => {
                PetStorage2015InfoManager.getMiniInfo(() => {
                    const info = new Map<number, PetStorage2015PetInfo>();
                    PetStorage2015InfoManager.allInfo.forEach((i) => info.set(i.catchTime, i));
                    this.miniInfo.update(info);
                });
            };

            this.miniInfo = new CacheData<Map<number, PetStorage2015PetInfo>>(new Map(), updateMiniInfo);

            this.miniInfo.deactivate();
            updateMiniInfo();

            this.defaultCt = PetManager.defaultTime;
        }
        this.hasInit = true;
    }

    async getAllPets(): Promise<Array<{ catchTime: number; name: string; id: number }>> {
        const data1 = (await this.bag.get()).flat();
        const data2 = Array.from((await this.miniInfo.get()).values());
        return [...data1, ...data2];
    }

    async getBagPets(location: PetLocation = PetLocation.Unknown): Promise<CaughtPet[]> {
        switch (location) {
            case PetLocation.Bag:
                return (await this.bag.get())[0];
            case PetLocation.SecondBag:
                return (await this.bag.get())[1];
            default:
                return [];
        }
    }

    cachePet(pet: CaughtPet) {
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
            resolvers.forEach((resolver) => {
                resolver(pet);
            });
            this.queryQueue.delete(pet.catchTime);
        }
    }

    async query(ct: CatchTime) {
        this.cache.delete(ct);
        this.cacheTimestamp.delete(ct);

        const all = await this.getAllPets();
        if (!all.some((pet) => pet.catchTime === ct)) {
            throw Error(`ct: ${ct} 不存在`);
        }

        const petInBag = this.bag
            .getImmediate()
            .flat()
            .find((pet) => pet.catchTime === ct);

        if (petInBag) {
            return petInBag;
        }

        if (!this.queryQueue.has(ct)) {
            this.queryQueue.set(ct, []);
            void socket.sendByQueue(CommandID.GET_PET_INFO, [ct]);
        }

        return new Promise<CaughtPet>((resolve) => {
            this.queryQueue.get(ct)!.push(resolve);
        });
    }
}

const ins = new SEAPetStore();

export { ins as SEAPetStore };
