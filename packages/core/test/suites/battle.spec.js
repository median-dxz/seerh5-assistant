import {
    Engine,
    Manager,
    Operator,
    SEAEventSource,
    SEAPet,
    Subscription,
    delay,
    matchNoBloodChain,
    matchSkillName,
} from '../../dist/index.js';
import env from '../env/pet.json';

var expect = chai.expect;

const startBattle = () => {
    FightManager.fightNoMapBoss(6730);
};

const $hook = SEAEventSource.hook;
const filterCMD = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];

describe('BattleManager', function () {
    /** @type {Subscription} */
    let sub;

    before(async () => {
        sub = new Subscription();
        await Engine.toggleAutoCure(true);

        $hook('socket:send').on((data) => {
            if (filterCMD.includes(data.cmd)) return;
            console.log(data);
        });
    });

    it('test preset strategy function', async function () {
        this.timeout('10s');

        const skn = matchSkillName(env.skill.map((v) => v.name));
        const nbc = matchNoBloodChain([env.测试精灵1.name, env.测试精灵3.name]);

        sub.on($hook('battle:start'), Manager.resolveStrategy);
        sub.on($hook('battle:roundEnd'), Manager.resolveStrategy);

        await Manager.takeover(startBattle, {
            async resolveMove(state, skills, _) {
                const skillId = skn(skills);
                if (state.self.catchtime === env.测试精灵1.catchTime) {
                    expect(skillId).equal(env.skill[0].id);
                }
                if (state.self.catchtime === env.测试精灵3.catchTime) {
                    expect(skillId).equal(env.skill[1].id);
                }
                const r = await Operator.useSkill(skillId);
                expect(r).to.be.true;
                return r;
            },
            async resolveNoBlood(state, _, pets) {
                const next = nbc(pets, state.self.catchtime);
                if (state.self.catchtime === env.测试精灵1.catchTime) {
                    expect(next).equal(2);
                }
                if (state.self.catchtime === env.测试精灵3.catchTime) {
                    expect(next).equal(-1);
                }
                if (next === -1) {
                    return Operator.escape();
                }
                return Operator.switchPet(next);
            },
        });
    });

    it('should exit when current battle ends after executing the operation in NoBlood', async function () {
        this.timeout('10s');
        let noBlood = false;

        const resolve = async () => {
            try {
                await Manager.resolveStrategy();
            } catch (error) {
                expect(error).to.match(/死切/);
                Operator.escape();
            }
        };

        sub.on($hook('battle:start'), resolve);
        sub.on($hook('battle:roundEnd'), resolve);

        await Manager.takeover(startBattle, {
            async resolveMove() {
                Operator.auto();
                expect(noBlood).to.be.false;
                return true;
            },
            async resolveNoBlood() {
                noBlood = true;
                return false;
            },
        });
    });

    beforeEach(async function () {
        const cts = [env.测试精灵1, env.测试精灵2, env.测试精灵3].map((v) => v.catchTime);
        await Engine.switchBag(cts);
        Engine.cureAllPet();
        await SEAPet(cts[0]).default();

        await delay(200);
        console.log(`${this.currentTest.title}: start`);
    });

    afterEach(async function () {
        sub.dispose();
        Engine.cureAllPet();

        await delay(1000);
        console.log(`${this.currentTest.title}: end`);
    });
});
