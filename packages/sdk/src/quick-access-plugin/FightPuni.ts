import Icon from './all_inclusive.svg';

export default class FightPuni implements SEAMod.IQuickAccessPlugin {
    logger: typeof console.log;
    meta: SEAMod.MetaData = {
        id: '对战谱尼',
        scope: 'median',
        type: 'quick-access-plugin',
    };
    icon = Icon;
    click() {
        FightManager.fightNoMapBoss(6730);
    }
}
