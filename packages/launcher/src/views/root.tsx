import type { ViewNode } from '@/context/useTabRouter';
import React from 'react';

import { CommonLevelPanel } from './Automation/CommonLevel';
import { DailySign } from './Automation/DailySign';
import { PetFragmentLevelPanel } from './Automation/PetFragmentLevel';
import { TaskStateView } from './Automation/TaskStateView';

import { CommonValue } from './CommonValue';
import { GameController } from './GameController';
import { ModManager } from './ModManager';
import { PackageCapture } from './PackageCapture';

import AutoMode from '@mui/icons-material/AutoModeRounded';
import DataObject from '@mui/icons-material/DataObjectRounded';
import Equalizer from '@mui/icons-material/EqualizerRounded';
import Route from '@mui/icons-material/RouteRounded';
import Settings from '@mui/icons-material/SettingsRounded';
import Tune from '@mui/icons-material/TuneRounded';
import Widgets from '@mui/icons-material/WidgetsRounded';

const placeholder = <Widgets fontSize="small" sx={{ opacity: 0 }} />;

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
            icon: <AutoMode fontSize="small" />,
            view: [
                { index: 1, default: true, name: '当前状态', icon: <Route fontSize="small" />, view: <TaskStateView /> },
                { index: 2, name: '签到', icon: placeholder, view: <DailySign /> },
                { index: 3, name: '因子', icon: placeholder, view: <PetFragmentLevelPanel /> },
                { index: 4, name: '关卡', icon: placeholder, view: <CommonLevelPanel /> },
            ],
        },
        {
            index: 2,
            name: '数据查询',
            icon: <DataObject fontSize="small" />,
            view: <CommonValue />,
        },

        {
            index: 3,
            name: '抓包调试',
            icon: <Equalizer fontSize="small" />,
            view: <PackageCapture />,
        },
        {
            index: 4,
            name: '模组管理',
            icon: <Widgets fontSize="small" />,
            view: <ModManager />,
        },
        {
            index: 5,
            name: '登录器设置',
            icon: <Settings fontSize="small" />,
            view: <div></div>,
        },
    ],
};
