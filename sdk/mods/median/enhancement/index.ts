import { scope } from '@/common/constants.json';
import { hookFn, SEAEventSource } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

import { backgroundHeartBeatCheck } from './backgroundHeartBeatCheck';
import { cancelAlertForUsePetItem } from './cancelAlertForUsePetItem';
import { fasterStaticAnimation } from './fasterStaticAnimation';

export const metadata = {
    id: 'EnhancementPresets',
    scope,
    version: '1.0.0',
    description: '游戏增强',
    configSchema: {
        betterAlarm: {
            type: 'checkbox',
            name: '更好的确认',
            description: '使用气泡提示代替单按钮确认对话框',
            default: true
        },
        fasterStaticAnimation: {
            type: 'checkbox',
            name: '加速静态动画',
            default: true
        },
        backgroundHeartBeatCheck: {
            type: 'checkbox',
            name: '启用离屏心跳包',
            default: true
        },
        cancelAlertForUsePetItem: {
            type: 'checkbox',
            name: '取消精灵物品使用确认',
            default: true
        },
        disableNewSkillPanelAfterBattle: {
            type: 'checkbox',
            name: '屏蔽新技能面板',
            description: '关闭战斗结束后由于精灵升级而弹出的新技能面板',
            default: true
        }
    }
} satisfies SEAModMetadata;

export default function ({ config }: SEAModContext<typeof metadata>) {
    const battleStart$ = SEAEventSource.hook('battle:start');
    const battleEnd$ = SEAEventSource.hook('battle:end');

    return {
        install() {
            if (config.betterAlarm) {
                hookFn(Alarm, 'show', function (_, text: string, cb?: () => void) {
                    console.log(`[info] 接管确认信息: ${text}`);
                    BubblerManager.getInstance().showText(text, true);
                    cb && cb();
                });
            }

            if (config.fasterStaticAnimation) {
                fasterStaticAnimation();
            }

            if (config.backgroundHeartBeatCheck) {
                backgroundHeartBeatCheck();
            }

            if (config.cancelAlertForUsePetItem) {
                cancelAlertForUsePetItem();
            }

            if (config.disableNewSkillPanelAfterBattle) {
                /* eslint-disable @typescript-eslint/unbound-method */

                // 屏蔽战斗结束后的获取新技能收发包回调, 从而屏蔽新技能面板的弹出
                battleStart$.on(() => {
                    SocketConnection.removeCmdListener(
                        CommandID.NOTE_UPDATE_SKILL,
                        PetUpdateCmdListener.onUpdateSkill,
                        PetUpdateCmdListener
                    );
                });
                battleEnd$.on(() => {
                    SocketConnection.addCmdListener(
                        CommandID.NOTE_UPDATE_SKILL,
                        PetUpdateCmdListener.onUpdateSkill,
                        PetUpdateCmdListener
                    );
                });
            }
        }
    } satisfies SEAModExport;
}

declare const Alarm: {
    show: (text: string, cb: () => void) => void;
};
