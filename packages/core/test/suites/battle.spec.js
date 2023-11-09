var expect = chai.expect;

describe('BattleManager', function () {
    this.timeout('60s');

    /** @type {typeof window.sac} */
    let core;

    before(() => {
        core = window.sac;
        core.HelperLoader();
    });

    beforeEach(async function () {
        console.log(`${this.currentTest.title}: start`);
    });

    afterEach(async function () {
        console.log(`${this.currentTest.title}: end`);
        await core.delay(1000);
    });
});

/*
    if (FighterModelFactory.playerMode == null) {
        throw `[error] 执行策略失败: 当前playerMode为空`;
    }

    if (Manager.hasSetStrategy()) {
        return;
    }

    await delay(300);
    let info = Provider.getCurRoundInfo()!;
    let skills = Provider.getCurSkills()!;
    const pets = Provider.getPets()!;

    let success = false;
    if (info.isSwitchNoBlood) {
        for (const petNames of strategy.dsl) {
            const matcher = new NoBloodSwitchLink(petNames);
            const index = matcher.match(pets, info.self.catchtime);
            success = await Operator.switchPet(index);
            if (success) {
                // log(`精灵索引 ${index} 匹配成功: 死切链: [${petNames.join('|')}]`);
                break;
            }
        }

        if (!success) {
            const index = strategy.fallback.resolveNoBlood(info, skills, pets);
            if (index) {
                (await Operator.switchPet(index)) || Operator.auto();
            }
            // log('执行默认死切策略');
        }

        await delay(300);
        skills = Provider.getCurSkills()!;
        info = Provider.getCurRoundInfo()!;
    }

    success = false;

    for (const skillNames of strategy.snm) {
        const matcher = new SkillNameMatch(skillNames);
        const skillId = matcher.match(skills);
        success = await Operator.useSkill(skillId);
        if (success) {
            // log(`技能 ${skillId} 匹配成功: 技能组: [${skillNames.join('|')}]`);
            break;
        }
    }

    if (!success) {
        strategy.fallback.resolveMove(info, skills, pets);
        // log('执行默认技能使用策略');
    }
*/