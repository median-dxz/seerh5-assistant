import { CacheData, NOOP, SAEventTarget, SaModuleLogger, defaultStyle, delay } from '../common/utils.js';
import { Hook } from '../constant/index.js';
import { findObject } from '../engine/index.js';
import { PetRoundInfo } from '../entity/index.js';
import { SocketListener } from '../event-bus/index.js';
import { Manager } from './manager.js';
import { Provider } from './provider.js';

const log = SaModuleLogger('SABattleManager', defaultStyle.core);

export const cachedRoundInfo = new CacheData<[PetRoundInfo, PetRoundInfo] | null>(null, NOOP);

export default () => {
    /** better switch pet handler */
    PetBtnView.prototype.autoUse = function () {
        this.getMC().selected = !0;
        if (this.locked) throw new Error('该精灵已被放逐，无法出战');
        if (this.mc.selected) {
            if (this.hp <= 0) throw new Error('该精灵已阵亡');
            if (this.info.catchTime == FighterModelFactory.playerMode?.info.catchTime)
                throw new Error('该精灵已经出战');
            this.dispatchEvent(new PetFightEvent(PetFightEvent.CHANGE_PET, this.catchTime));
        } else if (!this.mc.selected) {
            this.dispatchEvent(new PetFightEvent('selectPet', this.catchTime));
        }
        this.getMC().selected = !1;
    };

    SAEventTarget.on(Hook.BattlePanel.panelReady, () => {
        cachedRoundInfo.deactivate();
        if (FightManager.fightAnimateMode === 1) {
            TimeScaleManager.setBattleAnimateSpeed(10);
        }
        log(`检测到对战开始`);
    });

    SAEventTarget.on(Hook.BattlePanel.battleEnd, () => {
        const win = Boolean(FightManager.isWin);
        log(`检测到对战结束 对战胜利: ${win}`);
    });

    SAEventTarget.on(Hook.BattlePanel.endPropShown, () => {
        if (FightManager.fightAnimateMode === 1) {
            TimeScaleManager.setBattleAnimateSpeed(1);
        }
        if (window.petNewSkillPanel) {
            const newSkillPanel = findObject(petNewSkillPanel.PetNewSkillPanel).at(0);
            newSkillPanel?._view.hide();
            newSkillPanel?.onClose();
        }
        const currModule = ModuleManager.currModule;
        currModule.onClose();
        AwardManager.resume();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
            Promise.all([Manager.delayTimeout, delay(1000)])
                .then(() => {
                    Manager.unlockTrigger(isWin);
                    Manager.clear();
                })
                .catch((e) => {
                    console.error(e);
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
