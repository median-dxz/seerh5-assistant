import * as saco from '../src';
import { SaModuleLogger, defaultStyle } from '../src/logger';

const logger = SaModuleLogger('SATest', defaultStyle.core);

await saco.CoreLoader();

console.log(`环境检测: ${saco.checkEnv()}`);
window.saco  = saco;
console.log(`整体具名导入已挂载在saco命名空间下`);

let testModuleName = 'SAEngine/GameData';

logger(`开始测试功能模块: ${testModuleName}`);
