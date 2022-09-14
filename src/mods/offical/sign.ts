import data from '@data';
import * as saco from '../../assisant/core';

import { defaultStyle, SaModuleLogger } from '../../logger';
const log = SaModuleLogger('Sign', defaultStyle.mod);

const { Utils, Const, PetHelper, Functions } = saco;
const { CMDID } = Const;

class sign {
    constructor() {}
    async run() {
        let curTimes = (await Utils.GetMultiValue(Const.MULTIS.日常.刻印抽奖次数))[0];
        if (curTimes === 0) {
            //CMD MARKDRAW: 46301
            Utils.SocketSendByQueue(46301, [1, 0]);
        } else {
            log('今日已抽奖');
        }

        curTimes = (await Utils.GetMultiValue(Const.MULTIS.许愿.登录时长))[0];
        curTimes =
            curTimes +
            Math.floor(SystemTimerManager.sysBJDate.getTime() / 1e3) -
            MainManager.actorInfo.logintimeThisTime;
        curTimes = Math.floor(curTimes / 60);
        let t = 0;
        curTimes >= 120
            ? (t = 10)
            : curTimes >= 90
            ? (t = 7)
            : curTimes >= 60
            ? (t = 5)
            : curTimes >= 30
            ? (t = 3)
            : curTimes >= 15
            ? (t = 2)
            : curTimes >= 5
            ? (t = 1)
            : (t = 0);
        t -= (await Utils.GetMultiValue(Const.MULTIS.许愿.已许愿次数))[0];
        while (t--) {
            Utils.SocketSendByQueue(45801, [2, 1]);
        }

        curTimes = (await Utils.GetMultiValue(Const.MULTIS.战队.资源生产次数))[0];
        t = Math.max(0, 5 - curTimes);
        while (t--) {
            Utils.SocketSendByQueue(CMDID.RES_PRODUCTORBUY, [2, 0]);
        }
        curTimes = (await Utils.GetMultiValue(Const.MULTIS.许愿.许愿签到))[0];
        if (!curTimes) {
            t = (await Utils.GetMultiValue(Const.MULTIS.许愿.许愿签到天数))[0];
            Utils.SocketSendByQueue(45801, [1, t + 1]);
        }

        curTimes = (await Utils.GetMultiValue(11516))[0];
        if (!curTimes) {
            Utils.SocketSendByQueue(CMDID.VIP_BONUS_201409, 1);
        }
        curTimes = (await Utils.GetMultiValue(14204))[0];
        if (!curTimes) {
            Utils.SocketSendByQueue(CMDID.SEER_VIP_DAILY_REWARD);
        }
    }
    async teamDispatch() {
        try {
            await Utils.SocketSendByQueue(45809, 0);
        } catch (err) {
            void log('无法收取派遣');
        }
        const igonrePetNames = data.igonrePetNames;
        const PosType = Const.PETPOS;
        let reprogress = false;
        for (let tid = 16; tid > 0; tid--) {
            if (tid === 5) tid = 1;
            if (!reprogress) {
                // 清空背包
                for (let p of await PetHelper.getPets(PosType.bag1)) {
                    await PetHelper.setPetLocation(p.catchTime, PosType.storage);
                }
            }
            const data = await Utils.SocketSendByQueue(45810, tid)
                .then((v) => new DataView(v))
                .catch((err) => undefined);
            if (!data) continue;

            const a = data.getUint32(4);
            let e: {
                petIds: number[];
                cts: number[];
                levels: number[];
            } = {
                petIds: [],
                cts: [],
                levels: [],
            };
            for (let r = 0; r < a; r++) {
                e.cts.push(data.getUint32(8 + r * 12));
                e.petIds.push(data.getUint32(12 + r * 12));
                e.levels.push(data.getUint32(16 + r * 12));
            }

            log(`正在处理派遣任务: ${tid}`);
            reprogress = e.petIds.some((v) => igonrePetNames.has(PetXMLInfo.getName(v)));

            let index = 0;
            for (let pid of e.petIds) {
                const petName = PetXMLInfo.getName(pid);
                if (igonrePetNames.has(petName)) {
                    await PetHelper.setPetLocation(e.cts[index], 1);
                    log(`取出非派遣精灵: ${petName}`);
                }
                index++;
            }

            if (reprogress) {
                tid++;
            } else {
                console.table(e.petIds.map((v) => PetXMLInfo.getName(v)));
                Utils.SocketSendByQueue(45808, [tid, e.cts[0], e.cts[1], e.cts[2], e.cts[3], e.cts[4]]);
            }
            log(`派遣任务处理完成`);
        }
    }
    async markLvSetup() {
        if (!ModuleManager.hasmodule('markCenter.MarkCenter')) {
            await ModuleManager.showModule('markCenter');
        }
        markCenter.MarkLvlUp.prototype.lvlUpAll = function () {
            Functions.upMarkToTopLv(this.markInfo);
        };
    }
    async exchangeItem(itemId: number) {
        // t.ins = i._info.cfg,
        // t.caller = i,
        // t.callBack = function(t, n) {
        //     SocketConnection.sendByQueue(42395, [109, i._info.cfg.id, n, 0], function(t) {
        //         EventManager.dispatchEventWith(e.PanelConst.EVENT_UPDATE_PET_DATA)
        //     })
        // }
        //                 i.cfg = config.Exchange_clt.getItem(this.allItems[t]),
        // i.isCanGet = ItemManager.getNumByID(i.cfg.coinid) >= i.cfg.price;
        // var n = this._forveridArr.indexOf(i.cfg.UserInfoId);
        // i.userInfo = this._curDataForver[n],
        // ModuleManager.showModuleByID(1, t)
    }

    calc(items: number[]) {
        function dfs(dep: number) {
            if (items.length == 1) {
                return items[0] == 8;
            }
            for (let pos = 0; pos < items.length - 1; pos++) {
                let num1 = items[pos],
                    num2 = items[pos + 1];
                items.splice(pos, 2, Math.abs(num1 - num2));
                log('test' + pos + ': ' + num1 + ' ' + num2 + ' ' + items[pos], items);
                let ref = items[pos];
                let res = dfs(dep + 1);
                if (res) {
                    log(`pos${pos} : ${num1} - ${num2} -> ${ref}`);
                    return true;
                }
                items.splice(pos, 1, num1, num2);
                log('test failed' + pos + ': ', items);
            }
            return false;
        }
        log(dfs(1));
    }
}
export default {
    mod: sign,
};
