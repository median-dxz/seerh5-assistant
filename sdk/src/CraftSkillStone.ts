import { EventSource, GameConfigRegistry, ItemId, SEAPet, Socket, delay } from 'sea-core';

interface NatureObj extends seerh5.BaseObj {
    id: number;
    name: string;
}

declare class NatureXMLInfo {
    static _dataMap: seerh5.Dict<NatureObj>;
}

declare module 'sea-core' {
    export interface GameConfigMap {
        nature: NatureObj;
    }
}

const rate = [
    [0, 24, 5.8, 1.4, 0.3],
    [0, 0, 23, 5.5, 1.3],
    [0, 0, 0, 22, 5.3],
    [0, 0, 0, 0, 21],
];

function calcProbability(level: number, targetLevel: number) {
    return rate[level][targetLevel];
}

export default async function CraftSkillStone(createContext: SEAL.createModContext) {
    const { meta, logger } = await createContext({
        meta: {
            id: 'CraftSkillStone',
            scope: 'median',
            version: '1.0.0',
            core: '0.7.4',
            description: 'misc',
        },
    });

    const install = () => {
        GameConfigRegistry.register('nature', {
            iterator: {
                *[Symbol.iterator]() {
                    const arr = Object.values(NatureXMLInfo._dataMap);
                    for (const obj of arr) {
                        yield obj;
                    }
                },
            },
            objectId: (obj) => obj.id,
            objectName: (obj) => obj.name,
        });
    };

    const uninstall = () => {
        GameConfigRegistry.unregister('nature');
    };

    const craftDreamGem: SEAL.Command = {
        name: 'craftDreamGem',
        description: '合成梦幻宝石',
        async handler(_id: string, _left: string) {
            const [id, left] = [parseInt(_id), parseInt(_left)];
            const total = ItemManager.getNumByID(id);
            const { 低阶梦幻宝石, 中阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石, 高阶梦幻宝石 } = ItemId;
            const level = [低阶梦幻宝石, 中阶梦幻宝石, 高阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石] as const;
            for (let i = 1; i <= Math.trunc((total - left) / 4); i++) {
                Socket.sendByQueue(9332, [level.indexOf(id as (typeof level)[number]), 4]);
            }
        },
    };

    const resetNature: SEAL.Command = {
        name: 'resetNature',
        description: '刷性格',
        async handler(_ct: string, _nature: string) {
            const [ct, nature] = [parseInt(_ct), parseInt(_nature)];
            const query = GameConfigRegistry.getQuery('nature');

            for (; ; await delay(200)) {
                await SEAPet.get(ct).then((pet) => pet.useItem(300070));
                const info = await PetManager.UpdateBagPetInfoAsynce(ct);

                logger(`刷性格: 当前性格: ${query.getName(info.nature)}`);
                if (info.nature === nature) {
                    break;
                }

                await new Promise((resolve) => {
                    EventSource.socket(CommandID.MULTI_ITEM_LIST, 'receive').once(resolve);
                    ItemManager.updateItemNum([300070], [true]);
                });

                await delay(200);
                const num = ItemManager.getNumByID(300070);
                logger(`刷性格: 剩余胶囊数: ${num}`);
                if (num < 20) {
                    break;
                }
            }
        },
    };

    const craftOne: SEAL.Command = {
        name: 'craftOne',
        async handler() {
            let stones: Array<{
                name: string;
                level: number;
                id: number;
                num: number;
            }> = [];

            await new Promise((resolve) => {
                EventSource.socket(4475, 'receive').once(resolve);
                ItemManager.getSkillStone();
            });

            const stoneInfos = ItemManager.getSkillStoneInfos();
            stones = [];
            stoneInfos.forEach((stone) => {
                const stoneName = ItemXMLInfo.getName(stone.itemID);
                stones.push({
                    name: stoneName.replace('系技能', ''),
                    level: ItemXMLInfo.getSkillStoneRank(stone.itemID) - 1,
                    id: stone.itemID,
                    num: stone.itemNum,
                });
            });
            stones.sort((a, b) => a.level - b.level);

            const toCraft: {
                name: string;
                level: number;
                id: number;
            }[] = [];

            const getRate = () => {
                const maxValue = Math.max(...toCraft.map((v) => v.level));
                if (maxValue === 4 || !isFinite(maxValue)) return 0;
                const baseRate = toCraft.reduce((pre, cur) => pre + calcProbability(cur.level, maxValue + 1), 0);
                return Math.min(baseRate + 10, 100);
            };

            for (let i = 0; i < stones.length && toCraft.length < 4; i++) {
                const stone = stones[i];
                if (stone.num > 2 || stone.level > 0) {
                    toCraft.push(stone);
                }
            }
            if (toCraft.length < 4 || getRate() === 0) {
                return;
            }
            console.log(getRate(), toCraft);
            await Socket.sendByQueue(
                CommandID.SKILL_STONE_COMPOSE_ITEM,
                toCraft.map((v) => v.id)
            );
            // await this.init();
        },
    };

    return {
        meta,
        exports: { command: [craftDreamGem, resetNature, craftOne] },
        install,
        uninstall,
    } satisfies SEAL.ModExport;
}
