import * as Battle from '../battle';
import { delay, SAEventTarget } from '../common';
import { Hook } from '../constant';
import { PetRoundInfo } from '../entity/PetRoundInfo';

import { SeerModuleStatePublisher } from './ModuleSubscriber';
import { SocketDataAccess, SocketListenerBuilder } from './SocketSubscriber';

import { findObject } from '../engine';
import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('SAHookListener', defaultStyle.core);

declare var CommandID: {
    NOTE_USE_SKILL: 2505;
};

export function EventHandlerLoader() {
    SAEventTarget.addEventListener(Hook.Award.receive, (e) => {
        if (e instanceof CustomEvent) {
            log(`获得物品:`);
            const logStr = e.detail.items.map((v: any) => ItemXMLInfo.getName(v.id) + ' ' + v.count);
            log(logStr.join('\r\n'));
        }
    });

    SAEventTarget.addEventListener(Hook.BattlePanel.panelReady, () => {
        const subject = SocketDataAccess.subjects.get(CommandID.NOTE_USE_SKILL);
        subject && (subject.cache = null);
        if (FightManager.fightAnimateMode === 1) {
            PetFightController.setFightSpeed(10);
        }
        log(`检测到对战开始`);
    });

    SAEventTarget.addEventListener(Hook.BattlePanel.battleEnd, () => {
        const win = FightManager.isWin;
        log(`检测到对战结束 对战胜利: ${win}`);
    });

    SAEventTarget.addEventListener(Hook.BattlePanel.endPropShown, () => {
        if (FightManager.fightAnimateMode === 1) {
            PetFightController.setFightSpeed(1);
        }
        if (window.petNewSkillPanel) {
            const newSkillPanel = findObject(petNewSkillPanel.PetNewSkillPanel).at(0);
            newSkillPanel?._view.hide();
            newSkillPanel?.onClose();
        }
        const currModule = ModuleManager.currModule;
        currModule.onClose();
        EventManager.dispatchEvent(new PetFightEvent(PetFightEvent.ALARM_CLICK, CountExpPanelManager.overData));
        AwardManager.resume();
    });

    const onBattleEnd = (e: Event) => {
        if (e instanceof CustomEvent) {
            const { isWin } = e.detail as { isWin: boolean };
            if (Battle.Manager.hasSetStrategy()) {
                Promise.all([Battle.Manager.delayTimeout, delay(1000)]).then(() => {
                    Battle.Manager.unlockTrigger(isWin);
                    Battle.Manager.clear();
                });
            }
        }
    };

    const onRoundStart = () => {
        const info = Battle.Provider.getCurRoundInfo()!;
        const skills = Battle.Provider.getCurSkills()!;
        const pets = Battle.Provider.getPets()!;

        if (Battle.Manager.hasSetStrategy()) {
            Battle.Manager.resolveStrategy(info, skills, pets);
            log('执行自定义行动策略');
        }

        if (info.round <= 0) {
            Battle.Manager.delayTimeout = delay(5000);
        }
    };

    SAEventTarget.addEventListener(Hook.BattlePanel.panelReady, onRoundStart);
    SAEventTarget.addEventListener(Hook.BattlePanel.roundEnd, onRoundStart);
    SAEventTarget.addEventListener(Hook.BattlePanel.battleEnd, onBattleEnd);

    SAEventTarget.addEventListener(Hook.Module.loadScript, (e) => {
        if (e instanceof CustomEvent) {
            log(`检测到新模块加载: ${e.detail}`);
            const name = e.detail;
            SeerModuleStatePublisher.notifyAll(name, 'load');
        }
    });

    SAEventTarget.addEventListener(Hook.Module.construct, (e) => {
        if (e instanceof CustomEvent) {
            const name = e.detail;
            SeerModuleStatePublisher.notifyAll(name, 'show');
        }
    });

    SAEventTarget.addEventListener(Hook.Module.destroy, (e) => {
        if (e instanceof CustomEvent) {
            const name = e.detail;
            SeerModuleStatePublisher.notifyAll(name, 'destroy');
        }
    });

    SocketDataAccess.subscribe(CommandID.NOTE_USE_SKILL, (buffer) => {
        const roundInfo = new UseSkillInfo(new egret.ByteArray(buffer));
        return [new PetRoundInfo(roundInfo.firstAttackInfo), new PetRoundInfo(roundInfo.secondAttackInfo)] as const;
    });

    SocketDataAccess.attach(
        new SocketListenerBuilder<readonly [PetRoundInfo, PetRoundInfo]>(CommandID.NOTE_USE_SKILL)
            .res((data) => {
                const [fi, si] = data;
                log(
                    `对局信息更新:
                先手方:${fi.userId}
                hp: ${fi.hp.remain} / ${fi.hp.max}
                造成伤害: ${fi.damage}
                是否暴击:${fi.isCrit}
                使用技能: ${SkillXMLInfo.getName(fi.skillId)}
                ===========
                后手方:${si.userId}
                hp: ${si.hp.remain} / ${si.hp.max}
                造成伤害: ${si.damage}
                是否暴击:${si.isCrit}
                使用技能: ${SkillXMLInfo.getName(si.skillId)}`
                );
            })
            .cache()
    );
}
