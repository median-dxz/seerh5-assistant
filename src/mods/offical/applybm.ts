import { ReflectObjBase } from '@sa-core/mod-type';

declare class SkillMC extends egret.DisplayObjectContainer {
    animation: any;
}

declare class DBSkillAnimator {
    static skillMC: SkillMC;
    skillId: number;
    play(_: any, callback: CallBack, thisObj: any): void;
}

declare class CardPetAnimator {
    animate: any;
    playAnimate(t: any, e: CallBack, i: CallBack, thisObj: any): void;
}

class applyBm extends ReflectObjBase implements ModClass {
    constructor() {
        super();

        DBSkillAnimator.prototype.play = function (_, callback, thisObj) {
            const { skillMC } = DBSkillAnimator;
            PetFightController.mvContainer.addChild(skillMC);
            var o = SkillXMLInfo.getCategory(~~this.skillId);
            switch (o) {
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
                const cb = () => {
                    callback.call(thisObj);
                    skillMC.removeEventListener(dragonBones.EventObject.COMPLETE, cb, this);
                };
                skillMC.addEventListener(dragonBones.EventObject.COMPLETE, cb, this);
            }
        };

        CardPetAnimator.prototype.playAnimate = function (t, e, i, thisObj) {
            thisObj = thisObj ?? this;

            if (e) {
                if (FightManager.fightAnimateMode === 1) {
                    e.call(thisObj);
                } else {
                    egret.setTimeout(e.bind(thisObj), this, 1e3);
                }
            }

            if (this) {
                if (FightManager.fightAnimateMode === 1) {
                    i.call(thisObj);
                } else {
                    egret.setTimeout(i.bind(thisObj), this, 2e3);
                }
            }
            this.animate && this.animate.parent && this.animate.parent.addChild(this.animate);
        };
    }

    init() {}

    meta = { description: '' };
}

export default {
    mod: applyBm,
};
