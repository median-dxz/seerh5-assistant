import { EVENTS } from '../const/_exports';

import Pet from '../entities/pet';
import Skill from '../entities/skill';

import { BattleInfoProvider, PetSwitchInfos, RoundInfo } from './infoprovider';
import { BattleOperator } from './operator';

const { delay, SAEventTarget } = window;

type SkillModule = (battleStatus: RoundInfo, skills: Skill[], pets: PetSwitchInfos) => PromiseAble<void>;

interface BattleModule {
    entry: () => void;
    skillModule: SkillModule;
    finished: () => void;
}

let hadnleBattleStart = () => {
    console.log(`[BattleModuleManager]: 检测到对战开始, 当前模式: ${BattleModuleManager.isRun ? '对战接管' : '手动'}`);
    handleBattleModule();
};

let handleBattleModule = () => {
    FighterModelFactory.playerMode &&
        BattleModuleManager.isRun &&
        curBattle.skillModule &&
        curBattle.skillModule(
            BattleInfoProvider.getCurRoundInfo()!,
            BattleInfoProvider.getCurSkills()!,
            BattleInfoProvider.getPets()!
        );
};

let handleBattleEnd = (e: Event) => {
    if (e instanceof CustomEvent) {
        console.log(`[BattleModuleManager]: 检测到对战结束 对战胜利: ${e.detail.isWin}`);
        BattleModuleManager.signDeliver.dispatchEvent(new CustomEvent('bm_end'));
    }
};

SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, hadnleBattleStart);
SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, handleBattleModule);
SAEventTarget.addEventListener(EVENTS.BattlePanel.completed, handleBattleEnd);

let battleQueue: BattleModule[] = [];

let curBattle: Partial<BattleModule>;

export const BattleModuleManager = {
    isRun: false,
    signDeliver: new EventTarget(),

    queuedModule: (battleModule: BattleModule) => {
        battleQueue.push(battleModule);
    },
    runOnce: () => {
        if (battleQueue.length > 0) {
            curBattle = battleQueue.shift()!;
            BattleModuleManager.isRun = true;
            curBattle.entry?.();
            BattleModuleManager.signDeliver.addEventListener(
                'bm_end',
                () => {
                    curBattle.finished?.();
                    BattleModuleManager.isRun = false;
                },
                { once: true }
            );
        }
    },

    setCommonModule(skillModule: SkillModule) {
        curBattle.skillModule = skillModule;
        this.isRun = true;
    },
    clearCurModule() {
        delete curBattle.skillModule;
        this.isRun = false;
    },
};

function GenerateBaseBattleModule(
    nms: BaseSkillModule.NameMatched,
    dsp: BaseSkillModule.DiedSwitchLinked
): SkillModule {
    return async (info: RoundInfo, skills: Skill[], pets: PetSwitchInfos) => {
        if (info.isDiedSwitch) {
            const next = dsp.match(pets, info.self!.catchtime);
            if (next != -1) {
                BattleOperator.switchPet(next);
                await delay(800);
                skills = BattleInfoProvider.getCurSkills()!;
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

import * as BaseSkillModule from './skillmodule/base';
export { BaseSkillModule, GenerateBaseBattleModule };
export { BattleInfoProvider, BattleOperator };
