import { Socket, extendEngine } from '@sea/core';

export function extendCoreEngine() {
    engine.extend({
        async updateBattleFireInfo() {
            // 类型: 2913,
            // 到期时间戳: 2914,
            const r = await Socket.multiValue(2913, 2914);
            return {
                type: r[0],
                valid: r[1] > 0 && SystemTimerManager.time < r[1],
                timeLeft: r[1] - SystemTimerManager.time,
            };
        },
        changeEquipment(type: Parameters<UserInfo['requestChangeClothes']>[0], itemId: number) {
            return new Promise<void>((resolve) => {
                MainManager.actorInfo.requestChangeClothes(type, itemId, resolve);
            });
        },
    });
}
