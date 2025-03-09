/* eslint-disable */
import { scope } from '@/median/constants.json';
import { GameConfigRegistry, PetElement, SEAEventSource, SEAPetStore, delay, socket, spet } from '@sea/core';
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

declare var pvePetYinzi: any;

export const metadata = {
    id: 'CommandPresets',
    scope,
    version: '1.0.0',
    description: '预置命令组'
} satisfies SEAModMetadata;

export default function builtinCommands({ logger }: SEAModContext<typeof metadata>): SEAModExport {
    const filterUniversalMarks = (filter: (countermarkInfo: CountermarkInfo) => boolean) =>
        CountermarkController.getAllUniversalMark().reduce((pre, v) => {
            const name = v.markName;
            if (filter(v)) {
                if (pre.has(name)) {
                    pre.get(name)!.push(v);
                } else {
                    pre.set(v.markName, [v]);
                }
            }
            return pre;
        }, new Map<string, CountermarkInfo[]>());

    const commands: Command[] = [
        {
            name: 'getCurPanelInfo',
            handler() {
                logger(pvePetYinzi.DataManager._instance.curYinziData);
            }
        },
        {
            name: 'logDataByName',
            handler(args) {
                const { petName } = args as { petName: string };
                const data = config.xml
                    .getAnyRes('new_super_design')
                    .Root.Design.find((r: any) => (r.Desc as string).match(petName));
                logger(data);
            },
            parametersDescription: 'petName: 精灵名'
        },
        {
            name: 'calcAllEfficientPet',
            async handler(args) {
                const { e, radio } = args as { e: number; radio: number };
                const [bag1, bag2] = await SEAPetStore.bag.get();
                const mini = (await SEAPetStore.miniInfo.get()).values();
                const pets = [...bag1, ...bag2, ...mini];

                const r = pets.filter((v) => PetElement.formatById(PetXMLInfo.getType(v.id)).calcRatio(e) >= radio);
                logger(
                    r.map((v) => {
                        const eid = PetXMLInfo.getType(v.id);
                        return {
                            name: v.name,
                            elementId: eid,
                            element: SkillXMLInfo.typeMap[eid].cn,
                            id: v.id,
                            ratio: PetElement.formatById(eid).calcRatio(e)
                        };
                    })
                );
            },
            description: '计算可用的高倍克制精灵',
            parametersDescription: 'e: 要克制属性id, radio: 最低克制比例'
        },
        {
            name: 'refreshBatteryTime',
            handler() {
                const leftTime =
                    MainManager.actorInfo.timeLimit -
                    (MainManager.actorInfo.timeToday +
                        Math.floor(Date.now() / 1000 - MainManager.actorInfo.logintimeThisTime));
                BatteryController.Instance._leftTime = Math.max(0, leftTime);
            }
        },
        {
            name: 'delCounterMark',
            async handler(args) {
                const { i: preserved } = args as { i: number };
                const universalMarks = filterUniversalMarks((v) => v.catchTime === 0 && v.isBindMon === false);

                for (const [_, v] of universalMarks) {
                    if (v.length - preserved <= 0) continue;

                    logger(`删除多余刻印: ${v[0].markName} *${v.length - preserved}`);
                    await socket.sendByQueue(
                        41445,
                        [v.length - preserved].concat(
                            v
                                .toReversed() // 保留较新的刻印
                                .slice(preserved)
                                .map((v) => {
                                    CountermarkController.removeFromCache(v);
                                    return v.obtainTime;
                                })
                        )
                    );
                }
            },
            description: '删除多余刻印',
            parametersDescription: 'i: 保留的刻印数量'
        },
        {
            name: 'upgradeAllCounterMark',
            description: '一键升级所有刻印',
            async handler() {
                const universalMarks = filterUniversalMarks(
                    (v) => v.catchTime === 0 && v.isBindMon === false && v.level < 5
                );

                for (const [_, v] of universalMarks) {
                    for (let i = 0; i < v.length; i++) {
                        const mark = v[i];
                        logger(`升级刻印: ${mark.markName} lv${mark.level}`);
                        await socket.sendByQueue(41447, [mark.obtainTime]);
                        await delay(100);
                    }
                }

                await CountermarkController.init();
            }
        },
        {
            name: 'getClickTarget',
            handler() {
                LevelManager.stage.once(egret.TouchEvent.TOUCH_BEGIN, (e: egret.TouchEvent) => logger(e.target), null);
            }
        },
        {
            name: '关闭主页(挂机模式)',
            handler() {
                ModuleManager.currModule.hide();
            }
        },
        {
            name: '开启主页(恢复)',
            handler() {
                ModuleManager.currModule.show();
            }
        },
        {
            name: '返回主页(关闭所有模块)',
            handler() {
                ModuleManager.CloseAll();
            }
        },
        {
            name: '打开面板',
            handler(args) {
                const { panel } = args as { panel: string };
                void ModuleManager.showModule(panel);
            },
            parametersDescription: 'panel: 面板名'
        }
    ];

    const resetNature: Command = {
        name: 'resetNature',
        description: '刷性格',
        async handler(args) {
            const { ct, nature } = args as { ct: number; nature: number };
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
        commands: [...commands, resetNature, craftOne]
    };
}
