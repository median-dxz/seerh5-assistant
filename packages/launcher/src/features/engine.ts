import { Socket } from 'sea-core/engine';

export async function updateBattleFireInfo() {
    // 类型: 2913,
    // 到期时间戳: 2914,
    return Socket.multiValue(2913, 2914).then((r) => ({
        type: r[0],
        valid: r[1] > 0 && SystemTimerManager.time < r[1],
        timeLeft: r[1] - SystemTimerManager.time,
    }));
}
