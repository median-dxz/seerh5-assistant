/* eslint-disable */
import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { PetElement, SEAPetStore, delay, socket } from '@sea/core';
import type { Command, SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

declare var pvePetYinzi: any;

export const metadata = {
    id: 'builtin-command',
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION,
    core: CORE_VERSION,
    description: '内置命令组'
} satisfies SEAModMetadata;

export default function builtinCommand({ logger }: SEAModContext<typeof metadata>) {
    const commands: Command[] = [
        {
            name: 'getCurPanelInfo',
            handler() {
                logger(pvePetYinzi.DataManager._instance.curYinziData);
            }
        },
        {
            name: 'logDataByName',
            handler(petName: string) {
                const data = config.xml
                    .getAnyRes('new_super_design')
                    .Root.Design.find((r: any) => (r.Desc as string).match(petName));
                logger(data);
            }
        },
        {
            name: 'calcAllEfficientPet',
            async handler(_e: string, _radio: string) {
                const [e, radio] = [parseInt(_e), parseFloat(_radio)];
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
            description: '计算可用的高倍克制精灵'
        },
        {
            name: 'updateBatteryTime',
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
            async handler() {
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
                            await socket.sendByQueue(CommandID.COUNTERMARK_RESOLVE, [mark.obtainTime]);
                            await delay(100);
                        }
                    }
                }
            },
            description: '删除多余刻印'
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
        }
    ];

    return {
        commands
    } satisfies SEAModExport;
}
