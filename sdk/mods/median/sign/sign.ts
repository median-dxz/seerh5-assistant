import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

import { scope } from '@/common/constants.json';
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

export const metadata = {
    id: 'sign',
    scope,
    version: '1.0.0',

    description: '日常签到',
    configSchema: {
        'teamDispatch.ignorePets': {
            name: '忽略精灵列表',
            type: 'textInput',
            description: '战队派遣将忽略列表中的精灵名称, 以逗号分隔',
            default: ''
        },
        'teamSign.exchangeId': {
            name: '战队兑换',
            type: 'select',
            description: '在战队商店中兑换的物品',
            default: '10',
            list: EXCHANGE_LIST
        }
    }
} satisfies SEAModMetadata;

export default async function Sign({ config, logger }: SEAModContext<typeof metadata>) {
    return {
        tasks: [
            ...daily,
            teamDispatch(
                config['teamDispatch.ignorePets'].split(',').map((s) => s.trim()),
                logger
            ),
            ...teamSign(Number(config['teamSign.exchangeId'])),
            ...vip()
        ]
    } satisfies SEAModExport;
}
