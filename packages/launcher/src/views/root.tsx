import type { ViewNode } from '@/context/useTabRouter';
import React from 'react';
import { StrategiesView } from './BattleManager/StrategiesView';
import { CommonValue } from './CommonValue';
import { GameController } from './GameController';

export const root: ViewNode = {
    name: 'root',
    index: 0,
    view: [
        {
            index: 0,
            name: '控制中心',
            default: true,
            view: <GameController />,
        },
        {
            index: 1,
            name: '自动执行',
            view: [
                { index: 1, default: true, name: '全部', view: <div></div> },
                { index: 2, name: '因子', view: <div></div> },
                { index: 3, name: '日任', view: <div></div> },
                { index: 4, name: '其他', view: <div></div> },
            ],
        },
        {
            index: 2,
            name: '数据查询',
            view: <CommonValue />,
        },
        {
            index: 3,
            name: '战斗管理',
            view: [
                { index: 1, default: true, name: '当前状态', view: <div></div> },
                { index: 2, name: '策略', view: <StrategiesView /> },
                { index: 3, name: '战斗', view: <div></div> },
            ],
        },
        {
            index: 4,
            name: '抓包调试',
            view: <div></div>,
        },
        {
            index: 5,
            name: '模组管理',
            view: <div></div>,
        },
        {
            index: 6,
            name: '登录器设置',
            view: <div></div>,
        },
    ],
};
