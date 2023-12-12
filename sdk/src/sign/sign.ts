import { daily } from './daily';
import { teamSign } from './team';
import { teamDispatch } from './team-dispatch';

const EXCHANGE_LIST = {
    战队道具: {
        不灭能量珠: 10,
        愤怒珠子: 9,
        战队加成遗忘药: 8,
        特防珠: 6,
        防御珠: 5,
        特攻珠: 4,
        攻击珠: 3,
    },
    vip点数: {
        特性重组剂: 1,
        体力上限药: 3,
        上等体力药剂: 4,
    },
};

export default async function Sign(createContext: SEAL.createModContext) {
    const { meta, config, logger } = await createContext({
        meta: {
            id: 'sign',
            scope: 'median',
            description: '日常签到',
            core: '0.7.6',
        },
        defaultConfig: {
            teamDispatch: {
                ignorePets: [],
            },
            team: {
                exchangeId: 10,
            },
            vip: {
                exchangeId: 3,
            },
            ...EXCHANGE_LIST,
        },
    });

    return {
        meta,
        exports: {
            sign: [...daily, teamDispatch(config.teamDispatch.ignorePets, logger), ...teamSign(config.team.exchangeId)],
        },
    } satisfies SEAL.ModExport;
}
