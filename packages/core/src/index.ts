import chalk from 'chalk';
chalk.level = 3;

import * as utils from './common';

globalThis.delay = utils.delay;
globalThis.wrapper = utils.wrapper;

export * from './common';
export * from './entities';
export { CoreLoader } from './loader';
export { SaModuleLogger, defaultStyle } from './logger';
export { Mod, register as ModRegister } from './mod-loader';

