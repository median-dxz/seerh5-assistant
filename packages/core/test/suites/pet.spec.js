var expect = chai.expect;

describe('PetHelper', function () {
    this.timeout('15s');

    /** @type {typeof window.saCore} */
    let core;

    /** @type {typeof window.testEnv} */
    let env;

    before(() => {
        core = window.saCore;
        env = window.testEnv;
        core.toggleAutoCure(false);
    });

    beforeEach(async function () {
        await core.delay(1000);
    });

    it('should get a pet', async function () {
        const { catchTime, name } = env.pet.测试精灵1;

        const pet = await core.SAPet(catchTime).pet;

        expect(pet).to.be.an('object').that.has.property('__type', 'Pet');
        expect(pet.catchTime).equal(catchTime);
        expect(pet.name).equal(name);
    });

    it('should clear main bag', async function () {
        const { catchTime, name } = env.pet.测试精灵1;

        await core.switchBag([catchTime]);
        await core.switchBag([]);

        const pets = await core.getBagPets(1);
        expect(pets).to.be.an('array').that.is.empty;
    });

    it('should set pet in main bag and let it default', async function () {
        const { catchTime } = env.pet.测试精灵1;

        await core.SAPet(catchTime).setLocation(core.SAPetLocation.Bag);
        const loc = await core.SAPet(catchTime).location();

        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
    });

    it('should set pet in elite', async function () {
        const { catchTime } = env.pet.测试精灵1;

        await core.SAPet(catchTime).popFromBag();
        const loc = await core.SAPet(catchTime).location();

        expect(loc).to.be.an('string').equal(core.SAPetLocation.Elite);
    });

    it('should lower pet hp', async function () {
        const { catchTime } = env.pet.测试精灵1;

        await core.lowerBlood([catchTime]);

        const pet = core.SAPet(catchTime).pet;
        const loc = await core.SAPet(catchTime).location();

        expect(pet.hp).equal(50);
        expect(loc).to.be.an('string').equal(core.SAPetLocation.Default);
    });

    after(function () {
        core.toggleAutoCure(true);
    });
});
