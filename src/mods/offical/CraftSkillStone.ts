import * as sa from '@sa-core/index';
import { ReflectObjBase } from '@sa-core/mod-type';

class CraftSkillStone extends ReflectObjBase implements ModClass {
    constructor() {
        super();
    }

    stones: {
        name: string;
        level: number;
        id: number;
        num: number;
    }[] = [];

    async init() {
        await sa.Utils.SocketReceivedPromise(4475, () => {
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
            const baseRate = toCraft.reduce((pre, cur) => pre + this.calcProbability(cur.level, maxValue + 1), 0);
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
        await sa.Utils.SocketSendByQueue(
            CommandID.SKILL_STONE_COMPOSE_ITEM,
            toCraft.map((v) => v.id)
        );
        await this.init();
    }

    calcProbability(level: number, targetLevel: number) {
        const rate = [
            [0, 24, 5.8, 1.4, 0.3],
            [0, 0, 23, 5.5, 1.3],
            [0, 0, 0, 22, 5.3],
            [0, 0, 0, 0, 21],
        ];
        return rate[level][targetLevel];
    }

    meta = { description: '' };
}

export default {
    mod: CraftSkillStone,
};
