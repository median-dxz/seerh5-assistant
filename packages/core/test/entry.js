import * as lib from '../dist/index.js';
import testEnv from './env/main.js';

window.saCore = lib;
window.testEnv = testEnv;

await lib.CoreLoader();

mocha.run();
