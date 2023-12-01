import { PetDataManger, PetElement, Socket, delay } from 'sea-core';

export function getClickTarget() {
    LevelManager.stage.once(egret.TouchEvent.TOUCH_BEGIN, (e: egret.TouchEvent) => console.log(e.target), null);
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 */
export async function calcAllEfficientPet(e: number, radio = 1.5) {
    const [bag1, bag2] = await PetDataManger.bag.get();
    const mini = (await PetDataManger.miniInfo.get()).values();
    const pets = [...bag1, ...bag2, ...mini];

    const r = pets.filter((v) => PetElement.formatById(PetXMLInfo.getType(v.id)).calcRatio(e) >= radio);
    return r.map((v) => {
        const eid = PetXMLInfo.getType(v.id);
        return {
            name: v.name,
            elementId: eid,
            element: SkillXMLInfo.typeMap[eid].cn,
            id: v.id,
            ratio: PetElement.formatById(eid).calcRatio(e),
        };
    });
}

export async function delCounterMark() {
    const universalMarks = CountermarkController.getAllUniversalMark().reduce((pre, v) => {
        const name = v.markName;
        if (v.catchTime === 0 && v.isBindMon === false && v.level < 5) {
            if (pre.has(name)) {
                pre.get(name)!.push(v);
            } else {
                pre.set(v.markName, [v]);
            }
        }
        return pre;
    }, new Map<string, CountermarkInfo[]>());

    for (const [_, v] of universalMarks) {
        if (v.length > 5) {
            for (let i = 18; i < v.length; i++) {
                const mark = v[i];
                await Socket.sendByQueue(CommandID.COUNTERMARK_RESOLVE, [mark.obtainTime]);
                await delay(100);
            }
        }
    }
}

export async function updateBattleFireInfo() {
    // 类型: 2913,
    // 到期时间戳: 2914,
    return Socket.multiValue(2913, 2914).then((r) => ({
        type: r[0],
        valid: r[1] > 0 && SystemTimerManager.time < r[1],
        timeLeft: r[1] - SystemTimerManager.time,
    }));
}

export function updateBatteryTime() {
    const leftTime =
        MainManager.actorInfo.timeLimit -
        (MainManager.actorInfo.timeToday + Math.floor(Date.now() / 1000 - MainManager.actorInfo.logintimeThisTime));
    BatteryController.Instance._leftTime = Math.max(0, leftTime);
}
