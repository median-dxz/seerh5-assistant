import env from '../env/pet.json';

var expect = chai.expect;

describe('PetHelper', function () {
    this.timeout('15s');

    /** @type {typeof window.sac} */
    let core;

    before(() => {
        core = window.sac;
        core.toggleAutoCure(false);
        core.HelperLoader();
    });

    beforeEach(async function () {
        console.log(`${this.currentTest.title}: start`);
    });

    afterEach(async function () {
        console.log(`${this.currentTest.title}: end`);
        await core.delay(1000);
    });

    it('should get a pet', async function () {
        const { catchTime, name } = env.测试精灵1;

        const pet = await core.SAPet.get(catchTime);

        expect(pet).to.be.an('object').that.has.property('__type', 'Pet');
        expect(pet.catchTime).equal(catchTime);
        expect(pet.name).equal(name);
    });

    it('should clear main bag', async function () {
        const { catchTime, name } = env.测试精灵1;

        await core.switchBag([catchTime]);
        await core.switchBag([]);

        const pets = await core.getBagPets(1);
        expect(pets).to.be.an('array').that.is.empty;
    });

    it('should set pet in main bag and let it default', async function () {
        const { catchTime } = env.测试精灵1;

        await core.SAPet.setLocation(catchTime, core.SAPetLocation.Bag);
        const loc = await core.SAPet.location(catchTime);

        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
    });

    it('should cure pet', async function () {
        const { catchTime } = env.测试精灵1;

        await core.SAPet.cure(catchTime);
        const pet = await core.SAPet.get(catchTime);

        expect(pet.hp).equal(pet.maxHp);
    });

    it('should set pet in elite', async function () {
        const { catchTime } = env.测试精灵1;

        await core.SAPet.popFromBag(catchTime);
        const loc = await core.SAPet.location(catchTime);

        expect(loc).to.be.an('string').equal(core.SAPetLocation.Elite);
    });

    it('should get correct default', async function () {
        // *回归测试样例*
        const cts = [env.测试精灵1, env.测试精灵2].map((v) => v.catchTime);

        await core.switchBag(cts);
        await core.SAPet.popFromBag(cts[1]);

        let loc = await core.SAPet.location(cts[0]);
        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
        console.log(`loc1: ${loc} -> default`);

        await core.switchBag(cts);
        await core.SAPet.popFromBag(cts[0]);

        loc = await core.SAPet.location(cts[1]);
        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
        console.log(`loc2: ${loc} -> default`);

        await core.SAPet.popFromBag(cts[1]);

        loc = await core.SAPet.location(cts[1]);
        expect(loc).to.be.an('string').not.equal(core.SAPetLocation.Default).and.not.equal(core.SAPetLocation.Bag);
        console.log(`loc3: ${loc} -> elite/storage`);
    });

    it('should lower pet hp', async function () {
        const { catchTime } = env.测试精灵1;

        await core.lowerBlood([catchTime]);

        const pet = await core.SAPet.get(catchTime);
        const loc = await pet.location();

        expect(pet.hp).equal(50);
        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
    });

    it('should close the BattleEnd panel', async function () {
        expect(ModuleManager.currModule).instanceOf(mainPanel.MainPanel);
    });

    after(function () {
        core.toggleAutoCure(true);
    });
});
