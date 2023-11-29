import { getAutoCureState, toggleAutoCure } from 'sea-core';
import type { SEAMod } from '../../lib/mod';
import Icon from './local_hospital.svg?raw';

export default class FightPuni implements SEAMod.IQuickAccessPlugin {
    logger: typeof console.log;
    meta: SEAMod.MetaData = {
        scope: 'median',
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
