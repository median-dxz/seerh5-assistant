import type { ViewNode } from '@/context/useTabRouter';
import React from 'react';

import { BattleView } from './BattleManager/BattleView';
import { LevelView } from './BattleManager/LevelView';
import { StrategyView } from './BattleManager/StrategyView';

import { CommonLevelPanel } from './Automation/CommonLevel';
import { DailySign } from './Automation/DailySign';
import { PetFragmentLevelPanel } from './Automation/PetFragmentLevel';
import StateView from './BattleManager/StateView';
import { CommonValue } from './CommonValue';
import { GameController } from './GameController';
import { ModManager } from './ModManager';
import { PackageCapture } from './PackageCapture';

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
            name: '自动执行 >',
            view: [
                { index: 1, default: true, name: '签到', view: <DailySign /> },
                { index: 2, name: '因子', view: <PetFragmentLevelPanel /> },
                { index: 3, name: '关卡', view: <CommonLevelPanel /> },
            ],
        },
        {
            index: 2,
            name: '战斗管理 >',
            view: [
                { index: 1, default: true, name: '当前状态', view: <StateView /> },
                { index: 2, name: '策略', view: <StrategyView /> },
                { index: 3, name: '战斗', view: <BattleView /> },
                { index: 4, name: '关卡', view: <LevelView /> },
            ],
        },
        {
            index: 3,
            name: '数据查询',
            view: <CommonValue />,
        },

        {
            index: 4,
            name: '抓包调试',
            view: <PackageCapture />,
        },
        {
            index: 5,
            name: '模组管理',
            view: <ModManager />,
        },
        {
            index: 6,
            name: '登录器设置',
            view: <div></div>,
        },
    ],
};
