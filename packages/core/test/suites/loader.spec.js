var expect = chai.expect;

describe('Loader', function () {
    it('should be true', function () {
        const core = window.sea;
        expect(core.CoreReady).true;
        expect(core.SeerH5Ready).true;
        expect(core.checkEnv()).true;
    });

    it('should return true immediately', function (done) {
        const core = window.sea;
        core.CoreLoader().then((r) => {
            if (r) done();
            else done('load failed');
        });
    });
});
