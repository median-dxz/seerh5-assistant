import { Engine } from 'sea-core';
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
        Engine.toggleAutoCure(!this.autoCure);
    }

    async showAsync() {
        this.autoCure = await Engine.autoCureState();
        return `自动治疗: ${this.autoCure ? '开' : '关'}`;
    }
}
