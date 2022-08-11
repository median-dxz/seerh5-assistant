import * as saco from '../../proxy/core.js';

const { BattleModule, Utils, Const, Functions, PetHelper } = saco;
const { delay } = saco;
const { BaseSkillModule, BattleModuleManager, BattleOperator, BattleInfoProvider } = BattleModule;

class gy2 {
    battleMod = {
        defaultPet: 0,
        diedLink: new BaseSkillModule.DiedSwitchLinked(['月照星魂']),
        skillList: new BaseSkillModule.NameMatched(['月下华尔兹']),
        lowerbloodPets: [],
    };
    async init() {
        PetHelper.setDefault(this.battleMod.defaultPet);
        await new Promise((resolve, reject) => {
            Functions.LowerBlood(this.battleMod.lowerbloodPets, 300013, () => {
                resolve();
            });
        });
        BattleModuleManager.setCommonModule(async (info, skills, pets) => {
            if (info.isDiedSwitch) {
                let next = this.battleMod.diedLink.match(pets, info.pet.ct);
                next == -1 ? BattleOperator.escape() : BattleOperator.switchPet(next);
                await delay(800);
                skills = BattleInfoProvider.getCurSkills();
            }
            BattleOperator.useSkill(this.battleMod.skillList.match(skills));
        });
        BattleModuleManager.signDeliver.addEventListener('bm_end', async () => {
            if (PetManager.getPetInfo().skillArray[3].pp == 0 || PetManager.getPetInfo().hp == 0) {
                this.supply();
            }
            await delay(700);
            this.runOnce();
        });
    }
    bossIds = [12105, 12106, 12107, 12108, 12109, 12110, 12111, 12112, 12113];
    async runOnce() {
        const [ext] = await Utils.GetMultiValue(AttrConst.forever_gzcjykls_ext);
        if (!ext) {
            await Utils.SocketSendByQueue(CommandID.GZCJ_YKLS, [3, 2]);
        }
        const [current, i] = await Utils.GetMultiValue(AttrConst.forever_gzcjykls_ext, AttrConst.forever_gzcjykls_cnt);
        FightManager.fightNoMapBoss('', this.bossIds[current - 1]);
        console.log(`[光之惩戒2:] 当前能量${i & 255} ${(i >> 8) & 255}`);
    }
    supply() {
        if (PetManager.getPetInfo(0).skillArray[3].pp == 0) {
            Functions.UsePotionForPet(0, Const.ITEMS.Potion.中级活力药剂 - 1);
        }
        if (PetManager.getPetInfo(0).hp == 0) {
            Functions.UsePotionForPet(0, Const.ITEMS.Potion.高级体力药剂);
        }
    }
}
export default {
    mod: gy2,
};
