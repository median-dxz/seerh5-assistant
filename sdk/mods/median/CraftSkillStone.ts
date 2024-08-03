import { scope } from '@/median/constants.json';
import { GameConfigRegistry, SEAEventSource, delay, socket, spet } from '@sea/core';
import type { Command, SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

const rate = [
    [0, 24, 5.8, 1.4, 0.3],
    [0, 0, 23, 5.5, 1.3],
    [0, 0, 0, 22, 5.3],
    [0, 0, 0, 0, 21]
];

function calcProbability(level: number, targetLevel: number) {
    return rate[level][targetLevel];
}

export const metadata = {
    id: 'CraftSkillStone',
    scope,
    version: '1.0.0',
    description: 'misc'
} satisfies SEAModMetadata;

export default async function CraftSkillStone({ logger }: SEAModContext<typeof metadata>) {
    const install = () => {};

    const uninstall = () => {};

    const resetNature: Command = {
        name: 'resetNature',
        description: '刷性格',
        async handler(_ct: string, _nature: string) {
            const [ct, nature] = [parseInt(_ct), parseInt(_nature)];
            const query = GameConfigRegistry.getQuery('nature');

            for (; ; await delay(200)) {
                await spet(ct).useItem(300070).done;
                const info = await PetManager.UpdateBagPetInfoAsynce(ct);

                logger(`刷性格: 当前性格: ${query.getName(info.nature)}`);
                if (info.nature === nature) {
                    break;
                }

                await new Promise((resolve) => {
                    SEAEventSource.socket(CommandID.MULTI_ITEM_LIST, 'receive').once(resolve);
                    ItemManager.updateItemNum([300070], [true]);
                });

                await delay(200);
                const num = ItemManager.getNumByID(300070);
                logger(`刷性格: 剩余胶囊数: ${num}`);
                if (num < 20) {
                    break;
                }
            }
        }
    };

    const craftOne: Command = {
        name: 'craftOne',
        async handler() {
            let stones: Array<{
                name: string;
                level: number;
                id: number;
                num: number;
            }> = [];

            await new Promise((resolve) => {
                SEAEventSource.socket(4475, 'receive').once(resolve);
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
                    num: stone.itemNum
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
            await socket.sendByQueue(
                CommandID.SKILL_STONE_COMPOSE_ITEM,
                toCraft.map((v) => v.id)
            );
            // await this.init();
        }
    };

    return {
        commands: [resetNature, craftOne],
        install,
        uninstall
    } satisfies SEAModExport;
}
