import {
    DataSource,
    Engine,
    Hook,
    Manager,
    PetLocation,
    SEAPet,
    Subscription,
    delay,
    getBagPets,
} from '../../dist/index.js';
import env from '../env/pet.json';

var expect = chai.expect;
const $hook = DataSource.hook;

describe('PetHelper', function () {
    this.timeout('15s');

    /** @type {Subscription} */
    let sub;

    before(async () => {
        await Engine.toggleAutoCure(false);

        sub = new Subscription();
        sub.on($hook(Hook.Battle.battleStart), Manager.resolveStrategy);
        sub.on($hook(Hook.Battle.roundEnd), Manager.resolveStrategy);
    });

    beforeEach(async function () {
        console.log(`${this.currentTest.title}: start`);
    });

    afterEach(async function () {
        console.log(`${this.currentTest.title}: end`);
        await delay(1000);
    });

    it('should get a pet', async function () {
        const { catchTime, name } = env.测试精灵1;

        const pet = await SEAPet.get(catchTime);

        expect(pet).to.be.an('object').that.has.property('__type', 'Pet');
        expect(pet.catchTime).equal(catchTime);
        expect(pet.name).equal(name);
    });

    it('should clear main bag', async function () {
        const { catchTime, name } = env.测试精灵1;

        await Engine.switchBag([catchTime]);
        await Engine.switchBag([]);

        const pets = await getBagPets(1);
        expect(pets).to.be.an('array').that.is.empty;
    });

    it('should set pet in main bag and let it default', async function () {
        const { catchTime } = env.测试精灵1;

        await SEAPet.setLocation(catchTime, PetLocation.Bag);
        const loc = await SEAPet.location(catchTime);

        expect(loc).to.be.an('string').equal(PetLocation.Default);
    });

    it('should cure pet', async function () {
        const { catchTime } = env.测试精灵1;

        await SEAPet.cure(catchTime);
        const pet = await SEAPet.get(catchTime);

        expect(pet.hp).equal(pet.maxHp);
    });

    it('should set pet in elite', async function () {
        const { catchTime } = env.测试精灵1;

        await SEAPet.popFromBag(catchTime);
        const loc = await SEAPet.location(catchTime);

        expect(loc).to.be.an('string').equal(PetLocation.Elite);
    });

    it('should get correct default', async function () {
        // *回归测试样例*
        const cts = [env.测试精灵1, env.测试精灵2].map((v) => v.catchTime);

        await Engine.switchBag(cts);
        await SEAPet.popFromBag(cts[1]);

        let loc = await SEAPet.location(cts[0]);
        expect(loc).to.be.an('string').equal(PetLocation.Default);
        console.log(`loc1: ${loc} -> default`);

        await Engine.switchBag(cts);
        await SEAPet.popFromBag(cts[0]);

        loc = await SEAPet.location(cts[1]);
        expect(loc).to.be.an('string').equal(PetLocation.Default);
        console.log(`loc2: ${loc} -> default`);

        await SEAPet.popFromBag(cts[1]);

        loc = await SEAPet.location(cts[1]);
        expect(loc).to.be.an('string').not.equal(PetLocation.Default).and.not.equal(PetLocation.Bag);
        console.log(`loc3: ${loc} -> elite/storage`);
    });

    it('should lower pet hp', async function () {
        const { catchTime } = env.测试精灵1;

        await Engine.switchBag([catchTime]);
        await SEAPet.cure(catchTime);
        await SEAPet.popFromBag(catchTime);

        await Engine.lowerHp([catchTime]);

        const pet = await SEAPet.get(catchTime);
        const loc = await pet.location();

        expect(pet.hp).equal(50);
        expect(loc).to.be.an('string').equal(PetLocation.Default);
    });

    it('should close the BattleEnd panel', async function () {
        expect(ModuleManager.currModule).instanceOf(mainPanel.MainPanel);
    });

    it('should toggle auto cure function', async function () {
        let state;

        await Engine.toggleAutoCure(false);
        state = await Engine.autoCureState();
        expect(state).is.false;

        await Engine.toggleAutoCure(true);
        state = await Engine.autoCureState();
        expect(state).is.true;
    });

    after(async () => {
        sub[Symbol.dispose]();
        await Engine.toggleAutoCure(true);
    });
});
