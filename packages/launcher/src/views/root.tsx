import type { ViewNode } from '@/context/useTabRouter';

import { GameController } from './GameControllerView';

import { CommonTaskView } from './AutomationView/CommonTaskView';
import { PetFragmentLevelView } from './AutomationView/PetFragmentLevelView';
import { TaskStateView } from './AutomationView/TaskStateView';

import { CommonValue } from './CommonValue';

import { InstallView } from './ModView/InstallView';
import { ManagementView } from './ModView/ManagementView';

import { PackageCapture } from './PackageCapture';

import AutoMode from '@mui/icons-material/AutoModeRounded';
import DataObject from '@mui/icons-material/DataObjectRounded';
import Download from '@mui/icons-material/DownloadRounded';
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
            view: <GameController />
        },
        {
            index: 1,
            name: '自动执行',
            icon: <AutoMode fontSize="small" />,
            view: [
                {
                    index: 1,
                    default: true,
                    name: '当前状态',
                    icon: <Route fontSize="small" />,
                    view: <TaskStateView />
                },
                { index: 2, name: '签到', icon: placeholder, view: <CommonTaskView isLevelView={false} /> },
                { index: 3, name: '因子', icon: placeholder, view: <PetFragmentLevelView /> },
                { index: 4, name: '关卡', icon: placeholder, view: <CommonTaskView isLevelView={true} /> }
            ]
        },
        {
            index: 2,
            name: '数据查询',
            icon: <DataObject fontSize="small" />,
            view: <CommonValue />
        },

        {
            index: 3,
            name: '抓包调试',
            icon: <Equalizer fontSize="small" />,
            view: <PackageCapture />
        },
        {
            index: 4,
            name: '模组',
            icon: <Widgets fontSize="small" />,
            view: [
                {
                    index: 1,
                    default: true,
                    name: '我的模组',
                    icon: <Widgets fontSize="small" />,
                    view: <ManagementView />
                },
                { index: 2, name: '安装新模组', icon: <Download fontSize="small" />, view: <InstallView /> }
            ]
        },
        {
            index: 5,
            name: '登录器设置',
            icon: <Settings fontSize="small" />,
            view: <div></div>
        }
    ]
};
