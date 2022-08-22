import { SocketReceivedPromise, SocketSendByQueue } from './sa-socket.js';

/**
 * @description 获取特定键值
 * @param {...number} value 要查询的值
 */
export async function GetMultiValue(...value) {
    if (!value) return;
    return KTool.getMultiValueAsync(value);
}

let dictMatch = (dict, reg, keyName) => {
    let r = [];
    for (let key in dict) {
        let name = dict[key][keyName];
        name && name.match(reg) && r.push(dict[key]);
    }
    return r;
};

export function matchItemName(nameReg) {
    return dictMatch(ItemXMLInfo._itemDict, nameReg, 'Name');
}

export function matchSkillName(nameReg) {
    return dictMatch(SkillXMLInfo.movesMap, nameReg, 'Name');
}

export function matchPetName(nameReg) {
    return dictMatch(PetXMLInfo._dataMap, nameReg, 'DefName');
}

export function getTypeIdByName(name) {
    Object.values(SkillXMLInfo.typeMap).forEach((v) => {
        if (v.cn.match(name)) {
            return v.id;
        }
    });
    return undefined;
}

export function getUserCurrency(type) {
    if (type === 'soul_of_titan') {
        return ItemManager.getNumByID(1400352);
    }
}

export async function updateMark(markInfo) {
    let lv = 5 - CountermarkController.getInfo(markInfo.obtainTime).level;
    while (lv--) {
        await Socket.SocketSendByQueue(CommandID.STRENGTHEN_COUNTERMARK, [markInfo.obtainTime]);
        await Socket.SocketSendByQueue(CommandID.SAVE_COUNTERMARK_PROPERTY, [markInfo.obtainTime]);
    }
    await Socket.SocketReceivedPromise(CommandID.GET_COUNTERMARK_LIST2, () => {
        CountermarkController.updateMnumberMark({ markID: markInfo.markID, catchTime: markInfo.obtainTime });
    });
    EventManager.dispatchEvent(
        new CountermarkEvent(CountermarkEvent.UPGRADE_END, CountermarkController.getInfo(markInfo.obtainTime))
    );
}

export async function getStatusName(id) {
    return PetStatusEffectConfig.getName(0, id);
}

export * from './sa-socket.js';