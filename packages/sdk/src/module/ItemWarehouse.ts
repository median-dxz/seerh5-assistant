import type { Pet } from 'sa-core';
import { PetDataManger, SAPet, hookPrototype, isPetEffectActivated } from 'sa-core';

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
        return SAPet.get(r.catchTime);
    } else {
        return null;
    }
}

class ItemWareHouse implements SAMod.IModuleMod<itemWarehouse.ItemWarehouse> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'itemWarehouse',
        scope: 'median',
        type: 'module',
        description: '物品仓库修改, 提供更换的精灵因子界面交互',
    };

    moduleName = 'itemWarehouse';

    load() {
        hookPrototype(itemWarehouse.ItemWarehouse, 'onShowPetFactorInfo', async function (fn) {
            fn();
            const data: PetFragment = this._list.selectedItem;
            const pet = await findPetById(data.MonsterID);

            if (this._petFactorPage === 1) {
                this.txtPetname.text = `${PetXMLInfo.getName(data.MonsterID)} ${pet ? '(已获得)' : ''}`;
                DisplayUtil.setEnabled(this.btnhecheng, !Boolean(pet));
            } else if (this._petFactorPage === 2) {
                if (pet.hasEffect) {
                    const check = await isPetEffectActivated(pet);
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
    }
}

export default ItemWareHouse;
