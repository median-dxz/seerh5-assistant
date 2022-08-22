import { CMDID, EVENTS } from '../const/_exports.js';

import { BattleInfoProvider } from './infoprovider.js';
import { BattleOperator } from './operator.js';

const { delay, SAEventManager } = window;

let hadnleBattleStart = () => {
    console.log(`[BattleModuleManager]: 检测到对战开始, 当前模式: ${BattleModuleManager.isRun ? '对战接管' : '手动'}`);
    handleRoundEnd();
};

let handleRoundEnd = () => {
    FighterModelFactory.playerMode &&
        BattleModuleManager.isRun &&
        curBattle.skillModule &&
        curBattle.skillModule(
            BattleInfoProvider.getCurRoundInfo(),
            BattleInfoProvider.getCurSkills(),
            BattleInfoProvider.getPets()
        );
};

let handleBattleEnd = async (e) => {
    if (e instanceof CustomEvent) {
        console.log(`[BattleModuleManager]: 检测到对战结束 对战胜利: ${e.detail.isWin}`);
        BattleModuleManager.signDeliver.dispatchEvent(new CustomEvent('bm_end'));
    }
};

SAEventManager.addEventListener(EVENTS.BattlePanel.start, hadnleBattleStart);
SAEventManager.addEventListener(EVENTS.BattlePanel.roundEnd, handleRoundEnd);
SAEventManager.addEventListener(EVENTS.BattlePanel.completed, handleBattleEnd);

let battleQueue = [];

/**
 * @type {BattleModule}
 */
let curBattle = {
    entry: null,
    skillModule: null,
    finished: null,
};

export const BattleModuleManager = {
    isRun: false,
    signDeliver: new EventTarget(),
    /**
     * @param {Function} entry - 要执行的入口函数，调用后应该触发战斗
     * @param {SkillModule} skillModule - 战斗模型
     * @param {Function} finished - 结束后执行的回调函数，通过事件触发
     */
    queuedModule: (entry, skillModule, finished) => {
        battleQueue.push({
            entry,
            skillModule,
            finished,
        });
    },
    runOnce: () => {
        if (battleQueue.length > 0) {
            curBattle = battleQueue.shift();
            BattleModuleManager.isRun = true;
            curBattle.entry();
            BattleModuleManager.signDeliver.addEventListener(
                'bm_end',
                () => {
                    curBattle.finished();
                    BattleModuleManager.isRun = false;
                },
                { once: true }
            );
        }
    },
    /**
     * @param {SkillModule} skillModule - 战斗模型
     */
    setCommonModule(skillModule) {
        curBattle.skillModule = skillModule;
        this.isRun = true;
    },
    clearCurModule() {
        curBattle.skillModule = null;
        this.isRun = false;
    },
};

/**
 * @param {BaseSkillModule.NameMatched} nms
 * @param {BaseSkillModule.DiedSwitchLinked} dsp
 * @returns {SkillModule}
 */
function GenerateBaseBattleModule(nms, dsp) {
    return async (info, skills, pets) => {
        if (info.isDiedSwitch) {
            const next = dsp.match(pets, info.pet.ct);
            if (next != -1) {
                BattleOperator.switchPet(next);
                await delay(800);
                skills = BattleInfoProvider.getCurSkills();
            } else {
                skills = [];
            }
        }
        const sid = nms.match(skills);
        if (sid != 0) {
            BattleOperator.useSkill(sid);
        }
    };
}

import * as BaseSkillModule from './skillmodule/base.js';
export { BaseSkillModule, GenerateBaseBattleModule };
export { BattleInfoProvider, BattleOperator };
