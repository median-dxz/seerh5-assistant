import type { Pet } from 'sea-core';
import { Engine, PetDataManger, SEAEventSource, SEAPet, hookPrototype } from 'sea-core';

interface PetFragment {
    EffectMsglog: number;
    ID: number;
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

export async function findPetById(id: number): Promise<Pet | null> {
    const data1 = (await PetDataManger.bag.get()).flat();
    const data2 = Array.from(await PetDataManger.miniInfo.get()).map(([_, pet]) => pet);
    const r = [...data1, ...data2].find((pet) => pet.id === id);
    if (r) {
        return SEAPet(r.catchTime).get();
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
            core: '0.7.11',
        },
    });

    const load = () => {
        // hookPrototype(itemWarehouse.ItemWarehouse, '', function () {
        //     t = [];
        //     e = PetFragmentXMLInfo.GetShowArrInfos(1);
        //     i = function (t) {
        //         var e = t.Rarity;
        //         return o._curRarity.indexOf(e) > -1;
        //     };
        //     n = [];
        //     r = [];
        //     s = [];
        //     e.filter(function (t) {
        //         var e = t,
        //             a = e.MonsterID,
        //             u = +PetXMLInfo.getType(a),
        //             _ = i(e),
        //             h = ItemManager.checkPetFactorRedFlag(t.ID, e),
        //             c = ItemManager.getInfo(t.ID);

        //         let l;
        //         if (1 == o.allType) {
        //             l = true;
        //         } else if (2 == o.allType) {
        //             l = h;
        //         } else {
        //             l = !c;
        //         }

        //         g = (o._currentAttributeID.indexOf(u) > -1 || !o._currentAttributeID.length) && l && _;
        //         return g && (h ? n.push(t) : c ? r.push(t) : s.push(t)), g;
        //     });
        //     return (this.currList = n.concat(r, s));
        // });
        hookPrototype(itemWarehouse.ItemWarehouse, 'onShowPetFactorInfo', async function (fn) {
            fn();
            const data: PetFragment = this._list.selectedItem;
            const pet = (await findPetById(data.MonsterID))!;

            if (this._petFactorPage === 1) {
                this.txtPetname.text = `${PetXMLInfo.getName(data.MonsterID)} ${pet ? '(已获得)' : ''}`;
                DisplayUtil.setEnabled(this.btnhecheng, !Boolean(pet));
            } else if (this._petFactorPage === 2) {
                if (pet.hasEffect) {
                    const check = await Engine.isPetEffectActivated(pet);
                    this.txtTexing.text = `专属特性: ${check ? '已开启' : '未开启'}`;
                    DisplayUtil.setEnabled(this.btnhecheng, !check);
                }
            } else if (this._petFactorPage === 3) {
                if (pet.hideSkillActivated != undefined) {
                    const hideSkillId = data.MoveID;
                    this.txtMsg_kb_3.text = `${SkillXMLInfo.getName(hideSkillId)} ${
                        pet.hideSkillActivated ? '(已开启)' : '(未开启)'
                    }`;
                    DisplayUtil.setEnabled(this.btnhecheng, !pet.hideSkillActivated);
                }
            }
        });
    };

    let sub: number;
    const ds = SEAEventSource.gameModule('itemWarehouse', 'load');

    const install = () => {
        sub = ds.on(load);
    };

    const uninstall = () => {
        ds.off(sub);
    };

    return {
        meta,
        install,
        uninstall,
    } satisfies SEAL.ModExport;
}
