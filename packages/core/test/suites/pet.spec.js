import {
    Engine,
    Manager,
    PetLocation,
    SEAEventSource,
    SEAPet,
    Subscription,
    delay,
    getBagPets,
} from '../../dist/index.js';
import { ProxyPet } from '../../dist/pet-helper/SEAPet.js';
import env from '../env/pet.json';

var expect = chai.expect;
const $hook = SEAEventSource.hook;

describe('PetHelper', function () {
    this.timeout('15s');

    /** @type {Subscription} */
    let sub;

    before(async () => {
        await Engine.toggleAutoCure(false);

        sub = new Subscription();
        sub.on($hook('battle:start'), Manager.resolveStrategy);
        sub.on($hook('battle:end'), Manager.resolveStrategy);
    });

    beforeEach(async function () {
        console.log(`${this.currentTest.title}: start`);
    });

    afterEach(async function () {
        console.log(`${this.currentTest.title}: end`);
        await delay(1000);
    });

    it('测试链式调用', async function () {
        const { catchTime } = env.测试精灵1;

        const pet = await SEAPet(catchTime).get();
        const ct = await SEAPet(catchTime).catchTime;
        await SEAPet(catchTime).default();
        const result_boolean = await SEAPet(catchTime).isDefault; // test getter
        const result_location = await SEAPet(catchTime).cure().location();
        const result_promise = await SEAPet(catchTime).get((pet) => {
            return pet.cure();
        });

        expect(pet).to.be.an('object').that.has.property('__type', 'Pet');
        expect(ct).equal(catchTime);
        expect(result_boolean).equal(true);
        expect(result_location).equal(PetLocation.Default);
        expect(result_promise).is.an('object').instanceOf(ProxyPet);
    });

    it('should get a pet', async function () {
        const { catchTime, name } = env.测试精灵1;

        const pet = await SEAPet(catchTime).get();

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

        await SEAPet(catchTime).setLocation(PetLocation.Bag);
        const loc = await SEAPet(catchTime).location();

        expect(loc).to.be.an('string').equal(PetLocation.Default);
    });

    it('should cure pet', async function () {
        const { catchTime } = env.测试精灵1;

        await SEAPet(catchTime).cure().done;
        const pet = await SEAPet(catchTime).get();

        expect(pet.hp).equal(pet.maxHp);
    });

    it('should set pet in elite', async function () {
        const { catchTime } = env.测试精灵1;

        await SEAPet(catchTime).popFromBag();
        const loc = await SEAPet(catchTime).location();

        expect(loc).to.be.an('string').equal(PetLocation.Elite);
    });

    it('should get correct default', async function () {
        // *回归测试样例*
        const cts = [env.测试精灵1, env.测试精灵2].map((v) => v.catchTime);

        await Engine.switchBag(cts);
        await SEAPet(cts[1]).popFromBag();

        let loc = await SEAPet(cts[0]).location();
        expect(loc).to.be.an('string').equal(PetLocation.Default);
        console.log(`loc1: ${loc} -> default`);

        await Engine.switchBag(cts);
        await SEAPet(cts[0]).popFromBag();

        loc = await SEAPet(cts[1]).location();
        expect(loc).to.be.an('string').equal(PetLocation.Default);
        console.log(`loc2: ${loc} -> default`);

        await SEAPet(cts[1]).popFromBag();

        loc = await SEAPet(cts[1]).location();
        expect(loc).to.be.an('string').not.equal(PetLocation.Default).and.not.equal(PetLocation.Bag);
        console.log(`loc3: ${loc} -> elite/storage`);
    });

    it('should lower pet hp', async function () {
        const { catchTime } = env.测试精灵1;

        await Engine.switchBag([catchTime]);
        await SEAPet(catchTime).cure().popFromBag();

        await Engine.lowerHp([catchTime]);

        const pet = await SEAPet(catchTime).get();
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
