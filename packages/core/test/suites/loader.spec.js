import { CoreLoader } from '../../dist/index.js';
import env from '../env/pet.json';

var expect = chai.expect;

describe('Loader', function () {
    it('should be true', function () {
        const core = window.sea;
        expect(core.CoreReady).true;
    });

    it('should return true immediately', function (done) {
        CoreLoader(env.readyEvent).then((r) => {
            if (r) done();
            else done('load failed');
        });
    });
});
