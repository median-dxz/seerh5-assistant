import type { ViewNode } from '@/context/useTabRouter';
import React from 'react';

import { BattleView } from './BattleManager/BattleView';
import { LevelView } from './BattleManager/LevelView';
import { StrategyView } from './BattleManager/StrategyView';

import { CommonLevelPanel } from './Automation/CommonLevel';
import { DailySign } from './Automation/DailySign';
import { PetFragmentLevelPanel } from './Automation/PetFragmentLevel';
import { StateView } from './Automation/StateView';

import { CommonValue } from './CommonValue';
import { GameController } from './GameController';
import { ModManager } from './ModManager';
import { PackageCapture } from './PackageCapture';

import AutoFixHigh from '@mui/icons-material/AutoFixHighRounded';
import DataObject from '@mui/icons-material/DataObjectRounded';
import Equalizer from '@mui/icons-material/EqualizerRounded';
import Route from '@mui/icons-material/RouteRounded';
import Settings from '@mui/icons-material/SettingsRounded';
import Tune from '@mui/icons-material/TuneRounded';
import Widgets from '@mui/icons-material/WidgetsRounded';

export const root: ViewNode = {
    name: 'root',
    index: 0,
    view: [
        {
            index: 0,
            icon: <Tune fontSize="small" />,
            name: '控制中心',
            default: true,
            view: <GameController />,
        },
        {
            index: 1,
            name: '自动执行',
            icon: <AutoFixHigh fontSize="small" />,
            view: [
                { index: 1, default: true, name: '当前状态', icon: <Route fontSize='small'/>, view: <StateView /> },
                { index: 2, name: '签到', view: <DailySign /> },
                { index: 3, name: '因子', view: <PetFragmentLevelPanel /> },
                { index: 4, name: '关卡', view: <CommonLevelPanel /> },
            ],
        },
        {
            index: 2,
            name: '战斗管理',
            icon: <AutoFixHigh fontSize="small" />,
            view: [
                { index: 1, default: true, name: '策略', view: <StrategyView /> },
                { index: 2, name: '战斗', view: <BattleView /> },
                { index: 3, name: '关卡', view: <LevelView /> },
            ],
        },
        {
            index: 3,
            name: '数据查询',
            icon: <DataObject fontSize="small" />,
            view: <CommonValue />,
        },

        {
            index: 4,
            name: '抓包调试',
            icon: <Equalizer fontSize="small" />,
            view: <PackageCapture />,
        },
        {
            index: 5,
            name: '模组管理',
            icon: <Widgets fontSize="small" />,
            view: <ModManager />,
        },
        {
            index: 6,
            name: '登录器设置',
            icon: <Settings fontSize="small" />,
            view: <div></div>,
        },
    ],
};
