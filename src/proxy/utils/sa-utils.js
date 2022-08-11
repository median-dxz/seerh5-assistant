/**
 * @description 将数据包加到待发送队列
 * @param {Number} cmd 命令id
 * @param {Array} data 数据数组
 */
export async function SocketSendByQueue(cmd, data) {
    return new Promise((resolve, reject) => {
        SocketConnection.sendByQueue(
            cmd,
            data,
            (v) => resolve(v),
            (err) => reject(err)
        );
    });
}

/**
 * @description 获取特定键值
 * @param {...Number} value 要查询的值
 */
export async function GetMultiValue(...value) {
    if (value === null) return;
    return KTool.getMultiValueAsync(value);
}

/**
 * @description 计算克制倍率
 * @param {Number} e1 属性1id
 * @param {Number} e2 属性2id
 */
export function CalcElementRatio(e1, e2) {
    let mapping = (x) => {
        let obj = SkillXMLInfo.typeMap[x];
        if (obj.hasOwnProperty('is_dou')) {
            obj = obj.att.split(' ');
            obj = [SkillXMLInfo.typeMap[obj[0]].en, SkillXMLInfo.typeMap[obj[1]].en];
        } else {
            obj = [obj.en];
        }
        return obj;
    };
    e1 = mapping(e1);
    e2 = mapping(e2);
    return TypeXMLInfo.getRelationsPow(e1, e2);
}

let dictMatch = (dict, reg) => {
    let r = [];
    for (let key in dict) {
        let name = dict[key].Name;
        name && name.match(reg) && r.push(dict[key]);
    }
    return r;
};

export function matchItemName(nameReg) {
    return dictMatch(ItemXMLInfo._itemDict, nameReg);
}

export function matchSkillName(nameReg) {
    return dictMatch(SkillXMLInfo.movesMap, nameReg);
}

export function getTypeIdByName(name) {
    const dict = SkillXMLInfo.typeMap;
    for (let key in dict) {
        if (dict[key].cn.match(name)) {
            return dict[key];
        }
    }
    return undefined;
}

export function getUserCurrency(type) {
    if (type === 'soul_of_titan') {
        return ItemManager.getNumByID(1400352);
    }
}

export async function updateMark(ot) {
    let lv = 5 - CountermarkController.getInfo(1659320111).level;
    while (lv--) {
        await SocketSendByQueue(CommandID.STRENGTHEN_COUNTERMARK, [ot]);
        await SocketSendByQueue(CommandID.SAVE_COUNTERMARK_PROPERTY, [ot]);
    }
}
