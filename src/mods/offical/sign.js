import * as saco from '../../proxy/core.js';

let { Utils, Const } = saco;

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
    }
}
export default {
    mod: sign,
};
