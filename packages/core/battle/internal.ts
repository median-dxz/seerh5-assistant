import { CacheData, NULL, SAEventTarget, SaModuleLogger, defaultStyle, delay } from '../common';
import { Hook } from '../constant';
import { findObject } from '../engine';
import { PetRoundInfo } from '../entity';
import { SocketListener } from '../event-bus';
import { Manager } from './manager';
import { Provider } from './provider';

const log = SaModuleLogger('SABattleManager', defaultStyle.core);

export const cachedRoundInfo = new CacheData<[PetRoundInfo, PetRoundInfo] | null>(null, NULL);

export default () => {
    SAEventTarget.on(Hook.BattlePanel.panelReady, () => {
        cachedRoundInfo.deactivate();
        if (FightManager.fightAnimateMode === 1) {
            PetFightController.setFightSpeed(10);
        }
        log(`检测到对战开始`);
    });

    SAEventTarget.on(Hook.BattlePanel.battleEnd, () => {
        const win = FightManager.isWin;
        log(`检测到对战结束 对战胜利: ${win}`);
    });

    SAEventTarget.on(Hook.BattlePanel.endPropShown, async () => {
        if (FightManager.fightAnimateMode === 1) {
            PetFightController.setFightSpeed(1);
        }
        if (window.petNewSkillPanel) {
            const newSkillPanel = findObject(petNewSkillPanel.PetNewSkillPanel).at(0);
            newSkillPanel?._view.hide();
            newSkillPanel?.onClose();
        }
        const currModule: any = ModuleManager.currModule;
        currModule.onClose();
        AwardManager.resume();
        EventManager.dispatchEvent(new PetFightEvent(PetFightEvent.ALARM_CLICK, CountExpPanelManager.overData));
    });

    const onRoundStart = () => {
        const info = Provider.getCurRoundInfo()!;
        const skills = Provider.getCurSkills()!;
        const pets = Provider.getPets()!;

        if (Manager.hasSetStrategy()) {
            Manager.resolveStrategy(info, skills, pets);
            log('执行自定义行动策略');
        }

        if (info.round <= 0) {
            Manager.delayTimeout = delay(5000);
        }
    };

    SAEventTarget.on(Hook.BattlePanel.panelReady, onRoundStart);
    SAEventTarget.on(Hook.BattlePanel.roundEnd, onRoundStart);
    SAEventTarget.on(Hook.BattlePanel.battleEnd, () => {
        const isWin = Boolean(FightManager.isWin);
        if (Manager.hasSetStrategy()) {
            Promise.all([Manager.delayTimeout, delay(1000)]).then(() => {
                Manager.unlockTrigger(isWin);
                Manager.clear();
            });
        }
    });

    SocketListener.subscribe(CommandID.NOTE_USE_SKILL, (buffer) => {
        const roundInfo = new UseSkillInfo(new egret.ByteArray(buffer));
        const fi = new PetRoundInfo(roundInfo.firstAttackInfo);
        const si = new PetRoundInfo(roundInfo.secondAttackInfo);
        return [fi, si] as const;
    });

    SocketListener.on({
        cmd: CommandID.NOTE_USE_SKILL,
        res(data) {
            cachedRoundInfo.update([...data]);
            const [fi, si] = data;
            log(`对局信息更新:
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
                使用技能: ${SkillXMLInfo.getName(si.skillId)}`);
        },
    });
};
