import { log } from 'console';
import { ItemId, SAPet, Socket, delay } from 'sa-core';

const rate = [
    [0, 24, 5.8, 1.4, 0.3],
    [0, 0, 23, 5.5, 1.3],
    [0, 0, 0, 22, 5.3],
    [0, 0, 0, 0, 21],
];

function calcProbability(level: number, targetLevel: number) {
    return rate[level][targetLevel];
}

class CraftSkillStone extends BaseMod {
    stones: {
        name: string;
        level: number;
        id: number;
        num: number;
    }[] = [];

    craftDreamGem(id: number, left: number) {
        const total = ItemManager.getNumByID(id);
        const { 低阶梦幻宝石, 中阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石, 高阶梦幻宝石 } = ItemId;
        const level = [低阶梦幻宝石, 中阶梦幻宝石, 高阶梦幻宝石, 闪光梦幻宝石, 闪耀梦幻宝石] as const;
        for (let i = 1; i <= Math.trunc((total - left) / 4); i++) {
            Socket.sendByQueue(9332, [level.indexOf(id as (typeof level)[number]), 4]);
        }
    }

    async resetNature(ct: number, nature: number) {
        for (; ; await delay(200)) {
            await SAPet.get(ct).then((pet) => pet.useItem(300070));
            const info = await PetManager.UpdateBagPetInfoAsynce(ct);

            log(`刷性格: 当前性格: ${NatureXMLInfo.getName(info.nature)}`);
            if (info.nature === nature) {
                break;
            }
            await Socket.sendWithReceivedPromise(CommandID.MULTI_ITEM_LIST, () => {
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
    async init() {
        await Socket.sendWithReceivedPromise(4475, () => {
            ItemManager.getSkillStone();
        });
        const stoneInfos = ItemManager.getSkillStoneInfos();
        this.stones = [];
        stoneInfos.forEach((stone) => {
            const stoneName = ItemXMLInfo.getName(stone.itemID);
            this.stones.push({
                name: stoneName.replace('系技能', ''),
                level: ItemXMLInfo.getSkillStoneRank(stone.itemID) - 1,
                id: stone.itemID,
                num: stone.itemNum,
            });
        });
        this.stones.sort((a, b) => a.level - b.level);
    }

    async craftOne() {
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

        for (let i = 0; i < this.stones.length && toCraft.length < 4; i++) {
            const stone = this.stones[i];
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
        await this.init();
    }

    meta = { description: '', id: 'CraftSkillStone' };
}

export default CraftSkillStone;
