/* eslint-disable */
import { experiment_hookConstructor, hookPrototype } from '@sea/core';

/** parallel the skill animation in static animation mode */
export function fasterStaticAnimation() {
    hookPrototype(DBSkillAnimator, 'play', function (f, _, callback, thisObj) {
        const { skillMC } = DBSkillAnimator;
        PetFightController.mvContainer.addChild(skillMC);
        switch (SkillXMLInfo.getCategory(~~this.skillId)) {
            case 1:
                skillMC.animation.play('wugong', -1);
                skillMC.scaleX > 0 ? (skillMC.x = skillMC.x + 580) : (skillMC.x = skillMC.x - 560);
                break;
            case 2:
                skillMC.animation.play('tegong', -1);
                break;
            default:
                skillMC.animation.play('shuxing', -1), (skillMC.y = skillMC.y + 70);
                break;
        }
        if (FightManager.fightAnimateMode === 1) {
            callback.call(thisObj);
        } else {
            skillMC.once(dragonBones.EventObject.COMPLETE, callback.bind(thisObj), this);
        }
    });

    hookPrototype(CardPetAnimator, 'playAnimate', function (f, _, e, i, thisObj) {
        thisObj = thisObj ?? this;
        if (e)
            if (FightManager.fightAnimateMode === 1) e.call(thisObj);
            else egret.setTimeout(e.bind(thisObj), thisObj, 1000);
        if (this)
            if (FightManager.fightAnimateMode === 1) i.call(thisObj);
            else egret.setTimeout(i.bind(thisObj), thisObj, 2000);
        this.animate?.parent?.addChild(this.animate);
    });

    hookPrototype(UseSkillController, 'onMovieOver', function (f, ...args) {
        f.apply(this, ...args);
        if (FightManager.fightAnimateMode === 1) {
            this.textTimer && (this.textTimer.delay = 200);
        }
    });

    experiment_hookConstructor(RenewPPEffect, 'RenewPPEffect', function (ins) {
        if (FightManager.fightAnimateMode === 1) {
            ins.timer?.removeEventListener(egret.TimerEvent.TIMER, ins.closeTxt, ins);
            ins.timer?.stop();
            ins.timer = null;
            EventManager.dispatchEvent(new PetFightEvent(PetFightEvent.ON_USE_PET_ITEM));
        }
        return ins;
    });
}
