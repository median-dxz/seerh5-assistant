import type { Pet } from '@sea/core';
import {
    GameConfigRegistry,
    SEAEventSource,
    SEAPetStore,
    engine,
    hookPrototype,
    restoreHookedFn,
    spet,
    wrapper,
} from '@sea/core';

interface PetFragment {
    EffectMsglog: number;
    ID: number;
    itemID?: number;
    MonsterID: number;
    MoveID: number;
    MovesConsume: number;
    Name: string;
    NeedmonID: number;
    NewMsglogId: number;
    NewSeIdx: number;
    NewseConsume: number;
    PetConsume: number;
    PetLimit: number;
    Rarity: number;
    SeMsglog: number;
    effectId: number;
}

declare const DisplayUtil: {
    setEnabled(target: egret.DisplayObject, enabled: boolean): void;
};

declare class PetFragmentXMLInfo {
    static getItemByID(id?: number): PetFragment;
    static GetShowArrInfos(arg: number): PetFragment[];
}

declare global {
    namespace itemWarehouse {
        interface ItemWarehouse {
            currList: PetFragment[];
            getFilterPetFactorItems(): Promise<void>;
            _curRarity: number[];
            _currentAttributeID: number[];
            allType: number;
        }
    }
}

export async function findPetById(id: number): Promise<Pet | null> {
    const data = await SEAPetStore.getAllPets();
    const r = data.find((pet) => pet.id === id);
    if (r) {
        return spet(r.catchTime).get();
    } else {
        return null;
    }
}

export default async function ItemWareHouse(createContext: SEAL.createModContext) {
    const { meta } = await createContext({
        meta: {
            id: 'itemWarehouse',
            scope: 'median',
            description: '物品仓库修改, 提供更换的精灵因子界面交互',
            core: '1.0.0-rc.1',
        },
    });

    const load = () => {
        const skillQuery = GameConfigRegistry.getQuery('skill');
        const petQuery = GameConfigRegistry.getQuery('pet');
        hookPrototype(itemWarehouse.ItemWarehouse, 'getFilterPetFactorItems', async function (fn) {
            if (this.allType === 1) {
                return fn();
            }

            let r = PetFragmentXMLInfo.GetShowArrInfos(1)
                .filter((petFragment) => {
                    const { MonsterID } = petFragment;
                    const pet = petQuery.get(MonsterID);
                    if (!pet) return false;
                    // 筛选精灵属性
                    if (this._currentAttributeID.length > 0) {
                        return this._currentAttributeID.includes(pet.Type);
                    } else {
                        return true;
                    }
                })
                .filter(({ Rarity }) => this._curRarity.includes(Rarity)); // 筛选品质

            const allPets = await SEAPetStore.getAllPets();

            // 未拥有
            if (this.allType === 3) {
                this.currList = r.filter(({ MonsterID, ID }) => {
                    const itemCount = ItemManager.getNumByID(ID);
                    const pet = allPets.find((pet) => pet.id === MonsterID);
                    return !pet && itemCount > 0;
                });
            }

            // 可合成
            if (this.allType === 2) {
                const pets = await Promise.all(
                    allPets
                        .filter((pet) => {
                            return r.some(({ MonsterID }) => MonsterID === pet.id);
                        })
                        .map(async (pet_) => {
                            const pet = await spet(pet_.catchTime).done;
                            const notActivatedEffect = !(await engine.isPetEffectActivated(pet));
                            return {
                                id: pet.id,
                                notActivatedHideSkill: Boolean(pet.fifthSkill),
                                notActivatedEffect,
                            };
                        })
                );

                const filterResults = await Promise.all(
                    r.map(async ({ ID, MonsterID }) => {
                        const itemCount = ItemManager.getNumByID(ID);
                        const pet = pets.find((pet) => pet.id === MonsterID);
                        if (!pet) return false;

                        const { notActivatedEffect, notActivatedHideSkill } = pet;

                        return itemCount > 0 && (notActivatedEffect || notActivatedHideSkill);
                    })
                );
                this.currList = r.filter((_, i) => filterResults[i]);
            }

            // 按稀有度排序, 稀有度相同按ID倒序
            this.currList.sort((a, b) => {
                if (b.Rarity - a.Rarity) {
                    return b.Rarity - a.Rarity;
                } else {
                    return b.ID - a.ID;
                }
            });
        });

        // 显示因子是否获得并在对应情况下禁用兑换按钮
        itemWarehouse.ItemWarehouse.prototype.onShowPetFactorInfo = wrapper(
            itemWarehouse.ItemWarehouse.prototype.onShowPetFactorInfo
        ).after(async function (this: itemWarehouse.ItemWarehouse, _) {
            const data: PetFragment = this._list.selectedItem;

            // 对非唯一性精灵不做修改
            if (data.PetLimit !== 1) {
                return;
            }

            const pet = await findPetById(data.MonsterID);
            const itemCount = ItemManager.getNumByID(data.ID);

            let check: boolean | undefined = undefined;
            if (this._petFactorPage === 1) {
                this.txtPetname.text = `${petQuery.getName(data.MonsterID)} ${pet ? '(已获得)' : ''}`;
                check = data.PetConsume <= itemCount;
            } else if (this._petFactorPage === 2) {
                if (pet?.hasEffect) {
                    const activated = await engine.isPetEffectActivated(pet);
                    this.txtTexing.text = `专属特性: ${activated ? '已开启' : '未开启'}`;
                    check = data.NewseConsume <= itemCount && !activated;
                }
                if (!pet) {
                    check = false;
                }
            } else if (this._petFactorPage === 3) {
                if (pet?.hasFifthSkill != undefined) {
                    const fifthSkillId = data.MoveID;
                    this.txtMsg_kb_3.text = `${skillQuery.getName(fifthSkillId)} ${
                        pet.fifthSkill ? '(已开启)' : '(未开启)'
                    }`;
                    check = data.MovesConsume <= itemCount && !pet.fifthSkill;
                }
                if (!pet) {
                    check = false;
                }
            }

            if (check != undefined) {
                DisplayUtil.setEnabled(this.btnhecheng, check);
            }
        });

        // 尝试自动设置首发
        hookPrototype(itemWarehouse.ItemWarehouse, 'onCompose', async function (fn) {
            const data: PetFragment = this._list.selectedItem;

            // 对非唯一性精灵不做修改
            if (data.PetLimit !== 1) {
                return;
            }

            const { NeedmonID, MonsterID } = PetFragmentXMLInfo.getItemByID(data.itemID) || data;

            const needPet = await findPetById(NeedmonID);
            const pet = await findPetById(MonsterID);

            if (this._petFactorPage === 1 && NeedmonID && needPet) {
                await spet(needPet).default();
            } else if (this._petFactorPage > 1 && pet) {
                await spet(pet).default();
            }

            fn();
        });
    };

    let sub: number;
    const ds = SEAEventSource.gameModule('itemWarehouse', 'load');

    const install = () => {
        sub = ds.on(load);
        if (globalThis.itemWarehouse) {
            load();
        }
    };

    const uninstall = () => {
        if (globalThis.itemWarehouse) {
            restoreHookedFn(itemWarehouse.ItemWarehouse.prototype, 'onShowPetFactorInfo');
            restoreHookedFn(itemWarehouse.ItemWarehouse.prototype, 'onCompose');
        }
        ds.off(sub);
    };

    return {
        meta,
        install,
        uninstall,
    } satisfies SEAL.ModExport;
}
