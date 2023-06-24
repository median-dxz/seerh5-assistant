import { getAutoCureState, toggleAutoCure } from 'sa-core';
import Icon from './local_hospital.svg';

export default class FightPuni implements SAMod.IQuickAccessPlugin {
    logger: typeof console.log;
    meta: SAMod.MetaData = {
        author: 'median',
        id: 'toggleAutoCure',
        type: 'quick-access-plugin',
    };
    icon = Icon;

    autoCure = false;

    click() {
        toggleAutoCure(!this.autoCure);
    }

    async showAsync() {
        this.autoCure = await getAutoCureState();
        return `自动治疗: ${this.autoCure ? '开' : '关'}`;
    }
}
