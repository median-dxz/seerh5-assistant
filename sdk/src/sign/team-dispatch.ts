import {
    LevelAction,
    PetLocation,
    PetLocation as SEAPetLocation,
    SEAPetStore,
    socket,
    spet,
    type ILevelRunner,
    type LevelData,
} from '@sea/core';
import type { LevelMeta, Task, TaskRunner } from '@sea/launcher';
import { SignBase } from './SignBase';

declare class MainManager {
    static actorInfo: {
        teamInfo?: {
            id: number;
        };
    };
}

export const teamDispatch = (ignorePets: string[], logger: any) => {
    return class TeamDispatch extends SignBase implements TaskRunner {
        static readonly meta: LevelMeta = {
            id: 'TeamDispatch',
            name: '战队派遣',
            maxTimes: 1,
        };

        maxTimes = 1;

        get meta(): LevelMeta {
            return { ...TeamDispatch.meta, maxTimes: this.maxTimes };
        }

        actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
            [LevelAction.AWARD]: async () => {
                const hasDispatched: number[] = [];

                await socket.sendByQueue(45809, [0]).catch(() => logger('没有可收取的派遣'));
                await socket.sendByQueue(45807).then((r) => {
                    const bytes = new DataView(r!);
                    let offset = 12;
                    for (let i = 0; i < bytes.getUint32(8); i++) {
                        const id = bytes.getUint32(offset);
                        const timestamp = bytes.getUint32(offset + 24);
                        if (timestamp > 0) hasDispatched.push(id);
                        offset += 40;
                    }
                });

                const ignorePetNames = new Set(ignorePets);
                let reSelect = false;
                for (let tid = 16; tid > 0; tid--) {
                    if (tid === 5) tid = 1;
                    if (hasDispatched.includes(tid)) continue;
                    const pets = await SEAPetStore.getBagPets(PetLocation.Bag);
                    if (!reSelect) {
                        // 清空背包
                        for (const p of pets) {
                            await p.popFromBag();
                        }
                    }
                    const data = await socket
                        .sendByQueue(45810, [tid])
                        .then((v) => new DataView(v!))
                        .catch((_) => undefined);
                    if (!data) continue;

                    const a = data.getUint32(4);
                    const e: {
                        petIds: number[];
                        cts: number[];
                        levels: number[];
                    } = {
                        petIds: [],
                        cts: [],
                        levels: [],
                    };
                    for (let r = 0; r < a; r++) {
                        e.cts.push(data.getUint32(8 + r * 12));
                        e.petIds.push(data.getUint32(12 + r * 12));
                        e.levels.push(data.getUint32(16 + r * 12));
                    }

                    logger(`正在处理派遣任务: ${tid}`);
                    reSelect = e.petIds.some((v) => ignorePetNames.has(PetXMLInfo.getName(v)));

                    let index = 0;
                    for (const pid of e.petIds) {
                        const petName = PetXMLInfo.getName(pid);
                        if (ignorePetNames.has(petName)) {
                            await spet(e.cts[index]).setLocation(SEAPetLocation.Bag);
                            logger(`取出非派遣精灵: ${petName}`);
                        }
                        index++;
                    }

                    if (reSelect) {
                        tid++;
                    } else {
                        console.table(e.petIds.map((v) => PetXMLInfo.getName(v)));
                        socket.sendByQueue(45808, [tid, e.cts[0], e.cts[1], e.cts[2], e.cts[3], e.cts[4]]);
                    }
                }
            },
        };

        async update(): Promise<void> {
            const { teamInfo } = MainManager.actorInfo;
            if (teamInfo && teamInfo.id > 0) {
                const times = await socket.sendByQueue(45807).then((r) => new DataView(r!).getUint32(0));
                this.data.remainingTimes = Number(12 - times === 0);
            } else {
                this.data.remainingTimes = this.maxTimes = 0;
            }
        }
    } satisfies Task;
};
