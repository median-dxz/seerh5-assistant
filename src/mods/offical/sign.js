import * as saco from '../../proxy/core.js';
import data from '../common.config.js';

let { Utils, Const, PetHelper } = saco;

class sign {
    constructor() {}
    async run() {
        let curTimes = (await Utils.GetMultiValue(Const.MULTIS.日常.刻印抽奖次数))[0];
        if (curTimes == 0) {
            //CMD MARKDRAW: 46301
            Utils.SocketSendByQueue(46301, [1, 0]);
        } else {
            console.log('[AS]: 今日已抽奖');
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
            Utils.SocketSendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]);
        }
        curTimes = (await Utils.GetMultiValue(Const.MULTIS.许愿.许愿签到))[0];
        if (!curTimes) {
            t = (await Utils.GetMultiValue(Const.MULTIS.许愿.许愿签到天数))[0];
            Utils.SocketSendByQueue(45801, [1, t + 1]);
        }

        curTimes = (await Utils.GetMultiValue(11516))[0];
        if (!curTimes) {
            Utils.SocketSendByQueue(CommandID.VIP_BONUS_201409, [1]);
        }
        curTimes = (await Utils.GetMultiValue(14204))[0];
        if (!curTimes) {
            Utils.SocketSendByQueue(CommandID.SEER_VIP_DAILY_REWARD);
        }
    }
    async teamDispatch() {
        await SocketConnection.sendByQueue(45809, [0]);
        
        const igonrePetNames = data.igonrePetNames;
        const PosType = Const.PETPOS;
        let reprogress = false;
        for (let tid = 16; tid > 0; tid--) {
            if (tid == 5) tid = 1;
            if (!reprogress) {
                // 清空背包
                for (let p of PetHelper.getPets(PosType.bag1)) {
                    await PetHelper.setPetLocation(p.catchTime, PosType.storage);
                }
            }

            const t = await Utils.SocketSendByQueue(45810, [tid]);

            const i = t.data;
            const n = i.readUnsignedInt();
            const a = i.readUnsignedInt();
            const e = { petIds: [], cts: [], levels: [] };
            for (let r = 0; a > r; r++) {
                e.cts.push(i.readUnsignedInt());
                e.petIds.push(i.readUnsignedInt());
                e.levels.push(i.readUnsignedInt());
            }

            console.log(`[sign]: 正在处理派遣任务: ${tid}`);
            reprogress = e.petIds.some((v) => igonrePetNames.has(PetXMLInfo.getName(v)));

            let index = 0;
            for (let pid of e.petIds) {
                const petName = PetXMLInfo.getName(pid);
                if (igonrePetNames.has(petName)) {
                    await PetHelper.setPetLocation(e.cts[index], 1);
                    console.log(`[sign]: 取出非派遣精灵: ${petName}`);
                }
                index++;
            }

            if (reprogress) {
                tid++;
            } else {
                Utils.SocketSendByQueue(45808, [tid, e.cts[0], e.cts[1], e.cts[2], e.cts[3], e.cts[4]]);
            }
        }
        console.log(`[sign]: 派遣任务处理完成`);
    }
    async markLvSetup() {
        if (!ModuleManager.hasmodule('markCenter.MarkCenter')) {
            await ModuleManager.showModule('markCenter');
        }
        markCenter.MarkLvlUp.prototype.lvlUpAll = function () {
            Utils.updateMark(this.markInfo);
        };
    }
}
export default {
    mod: sign,
};
