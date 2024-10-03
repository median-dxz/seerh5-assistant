import { battle, engine, GameConfigRegistry, socket } from '@sea/core';

declare const config: {
    xml: {
        load: (name: string) => void;
    };
};

export function extendCore() {
    config.xml.load('new_super_design');
    config.xml.load('Fragment');

    GameConfigRegistry.register('nature', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.name,
        objectMap: new Map(Object.values(NatureXMLInfo._dataMap).map((obj) => [obj.id, obj]))
    });

    battle.manager.setFightDelay({ moveInterval: 500 });

    engine.extend({
        async battleFireInfo() {
            // 类型: 2913,
            // 到期时间戳: 2914,
            const r = await socket.multiValue(2913, 2914);
            return {
                type: r[0],
                valid: r[1] > 0 && SystemTimerManager.time < r[1],
                timeLeft: r[1] - SystemTimerManager.time
            };
        },
        changeEquipment(type: Parameters<UserInfo['requestChangeClothes']>[0], itemId: number) {
            return new Promise<void>((resolve) => {
                MainManager.actorInfo.requestChangeClothes(type, itemId, () => resolve(), null, {});
            });
        }
    });
}
