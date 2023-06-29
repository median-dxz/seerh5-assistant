import Icon from './all_inclusive.svg';

export default class FightPuni implements SAMod.IQuickAccessPlugin {
    logger: typeof console.log;
    meta: SAMod.MetaData = {
        id: '对战谱尼',
        author: 'median',
        type: 'quick-access-plugin',
    };
    icon = Icon;
    click() {
        FightManager.fightNoMapBoss(6730);
    }
}
