import { useRfcData } from '@sa-app/provider/useRfcData';
import {
    ItemId,
    Mod,
    PetPosition,
    SAEngine,
    SAPetHelper,
    SaModuleLogger,
    defaultStyle,
    delay,
    usePotionForPet,
} from 'seerh5-assistant-core';

const log = SaModuleLogger('Sign', defaultStyle.mod);

const MULTI = {
    日常: {
        刻印抽奖次数: 16577,
    },
    许愿: {
        登录时长: 12462,
        已许愿次数: 12231,
        许愿签到天数: 20235,
        许愿签到: 201345,
    },
    战队: {
        资源生产次数: 12470,
    },
} as const;

const AWARD_LIST = {
    vip点数: {
        特性重组剂: 1,
        体力上限药: 2,
    },
};

class sign extends Mod {
    meta = { description: '日任常用功能', id: 'sign' };
    data: any;
    init() {
        useRfcData().then((v) => {
            this.data = v;
        });
    }
    async run() {
        const CMDID = CommandID;
        let curTimes = (await SAEngine.Socket.multiValue(MULTI.日常.刻印抽奖次数))[0];
        if (curTimes === 0) {
            //CMD MARKDRAW: 46301
            SAEngine.Socket.sendByQueue(46301, [1, 0]);
        } else {
            log('今日已抽奖');
        }

        curTimes = (await SAEngine.Socket.multiValue(MULTI.许愿.登录时长))[0];
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
        t -= (await SAEngine.Socket.multiValue(MULTI.许愿.已许愿次数))[0];
        while (t--) {
            SAEngine.Socket.sendByQueue(45801, [2, 1]);
        }

        curTimes = (await SAEngine.Socket.multiValue(MULTI.战队.资源生产次数))[0];
        t = Math.max(0, 5 - curTimes);
        while (t--) {
            // RES_PRODUCT_BUY
            SAEngine.Socket.sendByQueue(CMDID.RES_PRODUCTORBUY, [2, 0]);
        }
        curTimes = (await SAEngine.Socket.multiValue(MULTI.许愿.许愿签到))[0];
        if (!curTimes) {
            t = (await SAEngine.Socket.multiValue(MULTI.许愿.许愿签到天数))[0];
            SAEngine.Socket.sendByQueue(45801, [1, t + 1]);
        }

        // vip点数
        curTimes = (await SAEngine.Socket.multiValue(11516))[0];
        if (!curTimes) {
            SAEngine.Socket.sendByQueue(CMDID.VIP_BONUS_201409, 1);
        }

        await delay(300);
        curTimes = MainManager.actorInfo.vipScore;
        if (curTimes >= 20) {
            SAEngine.Socket.sendByQueue(CommandID.VIP_SCORE_EXCHANGE, AWARD_LIST.vip点数.体力上限药).then(() => {
                EventManager.dispatchEventWith('vipRewardBuyOrGetItem');
            });
        }

        curTimes = (await SAEngine.Socket.multiValue(14204))[0];
        if (!curTimes) {
            SAEngine.Socket.sendByQueue(CMDID.SEER_VIP_DAILY_REWARD);
        }

        // 苍星签到
        [curTimes, t] = await SAEngine.Socket.multiValue(123157, 202284);
        if (curTimes < 80 && !t) {
            SAEngine.Socket.sendByQueue(41800, [89, 12]);
        }
    }
    async teamDispatch() {
        try {
            await SAEngine.Socket.sendByQueue(45809, 0);
        } catch (err) {
            void log('无法收取派遣');
        }
        const ignorePetNames = new Set(this.data.ignorePetNames);
        const PosType = PetPosition;
        let reprogress = false;
        for (let tid = 16; tid > 0; tid--) {
            if (tid === 5) tid = 1;
            if (!reprogress) {
                // 清空背包
                for (let p of await SAPetHelper.getBagPets(PosType.bag1)) {
                    await SAPetHelper.setPetLocation(p.catchTime, PosType.storage);
                }
            }
            const data = await SAEngine.Socket.sendByQueue(45810, tid)
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
            reprogress = e.petIds.some((v) => ignorePetNames.has(PetXMLInfo.getName(v)));

            let index = 0;
            for (let pid of e.petIds) {
                const petName = PetXMLInfo.getName(pid);
                if (ignorePetNames.has(petName)) {
                    await SAPetHelper.setPetLocation(e.cts[index], 1);
                    log(`取出非派遣精灵: ${petName}`);
                }
                index++;
            }

            if (reprogress) {
                tid++;
            } else {
                console.table(e.petIds.map((v) => PetXMLInfo.getName(v)));
                SAEngine.Socket.sendByQueue(45808, [tid, e.cts[0], e.cts[1], e.cts[2], e.cts[3], e.cts[4]]);
            }
            log(`派遣任务处理完成`);
        }
    }

    craftDreamGem(id: AttrConst<typeof ItemId.DreamGem>, left: number) {
        const total = ItemManager.getNumByID(id);
        const { 低阶梦幻宝石, 中阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石, 高阶梦幻宝石 } = ItemId.DreamGem;
        const level = [低阶梦幻宝石, 中阶梦幻宝石, 高阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石];
        for (let i = 1; i <= Math.trunc((total - left) / 4); i++) {
            SAEngine.Socket.sendByQueue(9332, [level.indexOf(id), 4]);
        }
    }

    async resetNature(ct: number, nature: number) {
        for (; ; await delay(200)) {
            await usePotionForPet(ct, 300070);
            const info = await PetManager.UpdateBagPetInfoAsynce(ct);

            log(`刷性格: 当前性格: ${NatureXMLInfo.getName(info.nature)}`);
            if (info.nature === nature) {
                break;
            }
            await SAEngine.Socket.sendWithReceivedPromise(CommandID.MULTI_ITEM_LIST, () => {
                ItemManager.updateItemNum([300070], [true]);
            });
            await delay(200);
            const num = ItemManager.getNumByID(300070);
            log(`刷性格: 剩余胶囊数: ${num}`);
            if (num < 20) {
                break;
            }
        }
    }
}
export default sign;
