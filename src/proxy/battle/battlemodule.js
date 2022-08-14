import consts from '../const/_exports.js';

import { delay } from '../utils/common.js';

import { SAEventManager } from '../eventhandler.js';

import { BattleInfoProvider } from './infoprovider.js';
import { BattleOperator } from './operator.js';

import { BattleModule, SkillModule } from './type.d.js';

let hadnleBattleStart = () => {
    console.log(`[BattleHandler]: 检测到对战开始, 当前模式: ${BattleModuleManager.isRun ? '对战接管' : '手动'}`);
    FighterModelFactory.enemyMode.setHpView(true);
    FighterModelFactory.enemyMode.setHpView = function (e) {
        this.propView.isShowFtHp = true;
    };
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

let handleBattleEnd = async () => {
    console.log('[BattleHandler]: 检测到对战结束');
    await delay(500);
    if (FightManager.isWin) {
        ModuleManager.currModule.touchHandle && ModuleManager.currModule.touchHandle();
    } else {
        ModuleManager.currModule.onClose && ModuleManager.currModule.onClose();
    }
    BattleModuleManager.signDeliver.dispatchEvent(new CustomEvent('bm_end'));
};

// todo : 不同模块的event deliver分开，思考全局事件注册的妥善处理方式
SAEventManager.addEventListener(consts.EVENTS.BattlePanel.start, hadnleBattleStart);
SAEventManager.addEventListener(consts.EVENTS.BattlePanel.roundEnd, handleRoundEnd);
SAEventManager.addEventListener(consts.EVENTS.BattlePanel.completed, handleBattleEnd);

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
 * @param {NameMatched} nms
 * @param {DiedSwitchLinked} dsp
 * @returns {SkillModule}
 */
function GenerateBaseBattleModule(nms, dsp) {
    return async (info, skills, pets) => {
        if (info.isDiedSwitch) {
            const next = dsp.match(pets);
            if (next != -1) {
                BattleOperator.switchPet(next);
            }
            await delay(800);
            skills = BattleInfoProvider.getCurSkills();
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
// stop

// run
