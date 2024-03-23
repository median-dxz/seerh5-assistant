import type { CreateModContext, ModExport } from '@sea/launcher';

import { daily } from './daily';
import { teamSign } from './team';
import { teamDispatch } from './team-dispatch';
import { vip } from './vip';

const EXCHANGE_LIST = {
    战队道具: {
        不灭能量珠: 10,
        愤怒珠子: 9,
        战队加成遗忘药: 8,
        特防珠: 6,
        防御珠: 5,
        特攻珠: 4,
        攻击珠: 3
    }
};

export default async function Sign(createContext: CreateModContext) {
    const { meta, config, logger } = await createContext({
        meta: {
            id: 'sign',
            scope: 'median',
            description: '日常签到',
            core: '1.0.0-rc.2'
        },
        defaultConfig: {
            teamDispatch: {
                ignorePets: []
            },
            team: {
                exchangeId: 10
            },
            ...EXCHANGE_LIST
        }
    });

    return {
        meta,
        exports: {
            task: [
                ...daily,
                teamDispatch(config.teamDispatch.ignorePets, logger),
                ...teamSign(config.team.exchangeId),
                ...vip()
            ]
        }
    } satisfies ModExport;
}
