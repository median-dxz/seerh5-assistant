import type { CreateModContext, ModExport } from '@sea/launcher';

import { daily } from './daily';
import { teamSign } from './team';
import { teamDispatch } from './team-dispatch';
import { vip } from './vip';

const EXCHANGE_LIST = {
    不灭能量珠: '10',
    愤怒珠子: '9',
    战队加成遗忘药: '8',
    特防珠: '6',
    防御珠: '5',
    特攻珠: '4',
    攻击珠: '3'
};

export default async function Sign(createContext: CreateModContext) {
    const { meta, config, logger } = await createContext({
        meta: {
            id: 'sign',
            scope: 'median',
            description: '日常签到',
            core: '1.0.0-rc.2'
        },
        config: {
            'teamDispatch.ignorePets': {
                name: '忽略精灵列表',
                type: 'input',
                description: '战队派遣将忽略列表中的ct, 以逗号分隔'
            },
            'teamSign.exchangeId': {
                name: '战队兑换',
                type: 'select',
                description: '在战队商店中兑换的物品',
                list: EXCHANGE_LIST as Record<string, string>
            }
        }
    });

    return {
        meta,
        exports: {
            task: [
                ...daily,
                teamDispatch(
                    config['teamDispatch.ignorePets'].split(',').map((s) => s.trim()),
                    logger
                ),
                ...teamSign(Number(config['teamSign.exchangeId'])),
                ...vip()
            ]
        }
    } satisfies ModExport;
}
