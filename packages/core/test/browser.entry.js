import * as core from '../src';

import './suites.js';

mocha.checkLeaks();

await core.CoreLoader();

window.sac = { core, ...sac };

mocha.run();
