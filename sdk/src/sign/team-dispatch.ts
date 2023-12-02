import { PetPosition, SEAPet, PetLocation as SEAPetLocation, getBagPets } from 'sea-core';
import { Socket } from 'sea-core/engine';

declare class MainManager {
    static actorInfo: {
        teamInfo?: {
            id: number;
        };
    };
}

export const teamDispatch = (ignorePets: string[], logger: any) => {
    return {
        name: '战队派遣',
        check: async () => {
            const { teamInfo } = MainManager.actorInfo;
            if (teamInfo && teamInfo.id > 0) {
                const times = await Socket.sendByQueue(45807).then((r) => new DataView(r!).getUint32(0));
                return Number(12 - times > 0);
            } else {
                return 0;
            }
        },
        async run() {
            const hasDispatched: number[] = [];

            await Socket.sendByQueue(45809, [0]).catch(() => logger('没有可收取的派遣'));
            await Socket.sendByQueue(45807).then((r) => {
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
            const PosType = PetPosition;
            let reSelect = false;
            for (let tid = 16; tid > 0; tid--) {
                if (tid === 5) tid = 1;
                if (hasDispatched.includes(tid)) continue;
                const pets = await getBagPets(PosType.bag1);
                if (!reSelect) {
                    // 清空背包
                    for (const p of pets) {
                        await p.popFromBag();
                    }
                }
                const data = await Socket.sendByQueue(45810, [tid])
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
                        await SEAPet.setLocation(e.cts[index], SEAPetLocation.Bag);
                        logger(`取出非派遣精灵: ${petName}`);
                    }
                    index++;
                }

                if (reSelect) {
                    tid++;
                } else {
                    console.table(e.petIds.map((v) => PetXMLInfo.getName(v)));
                    Socket.sendByQueue(45808, [tid, e.cts[0], e.cts[1], e.cts[2], e.cts[3], e.cts[4]]);
                }
            }
        },
    } satisfies SEAL.Sign;
};
