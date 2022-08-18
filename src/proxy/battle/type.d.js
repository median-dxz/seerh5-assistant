import Pet from '../entities/pet.js';
import Skill from '../entities/skill.js';

/**
 * 战斗中的行动模型，接受当前战斗的数据，并自行执行战斗操作
 * @typedef {(
 * battleStatus: RoundInfo,
 * skills: Skill[],
 * pets: Pet[]
 * )=> void} SkillModule
 */

/** 自动战斗模型，包含战斗前，自动战斗，战斗结束三个模块
 * @typedef BattleModule
 * @type {Object}
 * @property {Function}  BattleModule.entry
 * @property {SkillModule}  BattleModule.skillModule
 * @property {Function}  BattleModule.finished
 */

/**
 * @typedef RoundInfo
 * @type {Object}
 * @property {Object|undefined} pet
 * @property {Number|undefined} round
 * @property {boolean|undefined} isDiedSwitch
 */
